import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";

export async function GET() {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await UserModel.findOne({ email: session.user.email });

    if (!sessionUser) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    const households = await Household.find({
        $or: [
          { members: sessionUser._id },
          { admin: sessionUser._id },
        ],
      })
        .populate("admin", "username email profileImage")
        .populate("members", "username email profileImage")
        .lean();      

    return NextResponse.json({ households }, { status: 200 });
  } catch (error) {
    console.error("[Get Households Error]", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
