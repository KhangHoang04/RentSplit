import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";

export async function POST(req, { params }) {
  await connectToDB();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sessionUser = await UserModel.findOne({ email: session.user.email });
  if (!sessionUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const { amount, category, paid_by, date } = await req.json(); // make sure to use paid_by from client
  const householdId = params.id;

  if (!amount || !category || !paid_by) {
    return NextResponse.json({ message: "Amount, category, and payer are required" }, { status: 400 });
  }

  try {
    const household = await Household.findById(householdId)
      .populate("members", "_id")
      .populate("admin", "_id");

    if (!household) return NextResponse.json({ message: "Household not found" }, { status: 404 });

    const allUsers = [...household.members.map(m => m._id.toString()), household.admin._id.toString()];
    const filteredUsers = allUsers.filter(userId => userId !== paid_by);

    const share = parseFloat((amount / allUsers.length).toFixed(2));

    const expense = await Expense.create({
      household_id: household._id,
      amount,
      category,
      paid_by,
      date
    });

    const splits = await Promise.all(
      filteredUsers.map((userId) =>
        ExpenseSplit.create({
          expense_id: expense._id,
          user_id: userId,
          amount: share,
          date
        })
      )
    );

    return NextResponse.json({ message: "Expense created", expense, splits }, { status: 201 });
  } catch (error) {
    console.error("[Create Expense Error]", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

