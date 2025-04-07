// app/api/household/[id]/remove/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";

export async function POST(req, { params }) {
  await connectToDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sessionUser = await UserModel.findOne({ email: session.user.email });
  if (!sessionUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const { email } = await req.json();
  const householdId = params.id;

  try {
    const userToRemove = await UserModel.findOne({ email });
    if (!userToRemove) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const household = await Household.findById(householdId);
    if (!household) return NextResponse.json({ message: "Household not found" }, { status: 404 });

    if (!household.admin.equals(sessionUser._id)) {
      return NextResponse.json({ message: "Only admin can remove members" }, { status: 403 });
    }

    // Don't let admin remove themselves
    if (household.admin.equals(userToRemove._id)) {
      return NextResponse.json({ message: "Cannot remove admin" }, { status: 400 });
    }

    household.members = household.members.filter(
      (memberId) => !memberId.equals(userToRemove._id)
    );
    await household.save();

    return NextResponse.json({ message: "Member removed" });
  } catch (err) {
    console.error("[Remove Member Error]", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
