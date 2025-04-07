// app/api/household/[id]/get/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";

export async function GET(_req, { params }) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await UserModel.findOne({ email: session.user.email });
    if (!sessionUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id } = params;

    const household = await Household.findById(id)
      .populate("admin", "username email profileImage")
      .populate("members", "username email profileImage")
      .lean();

    if (!household) {
      return NextResponse.json({ message: "Household not found" }, { status: 404 });
    }

    // Combine admin and members into a single array
    const allMembers = [
      { ...household.admin, role: "admin" },
      ...household.members.map((m) => ({ ...m, role: "member" })),
    ];

    return NextResponse.json({ household, allMembers }, { status: 200 });
  } catch (error) {
    console.error("[Get Household by ID Error]", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
