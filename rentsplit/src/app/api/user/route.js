// app/api/user/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import { UserModel } from "@/core/models/User";

export async function GET(req) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // You can limit the fields if needed
    return NextResponse.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("[User Info Error]", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
