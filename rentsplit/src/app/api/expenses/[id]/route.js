import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";
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

    const { id: householdId } = params;

    const household = await Household.findById(householdId);
    if (!household) {
      return NextResponse.json({ message: "Household not found" }, { status: 404 });
    }

    const expenses = await Expense.find({ household_id: householdId })
      .populate("paid_by", "username email profileImage")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (error) {
    console.error("[Get Household Expenses Error]", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
