import { NextResponse } from "next/server";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";

export async function GET(req, { params }) {
  await connectToDB()

  try {
    const { userId } = params;

    const splits = await ExpenseSplit.find({ user_id: userId })
    .populate([
      {
        path: 'expense_id',
        populate: {
          path: 'paid_by',
          select: 'username email profileImage', // nested populate on expense
        },
      },
      {
        path: 'user_id',
        select: 'username email profileImage', // populate user_id field itself
      },
    ])
    .sort({ date: -1 })
    .lean();

    return NextResponse.json({ splits });
  } catch (err) {
    console.error("Error fetching ExpenseSplits:", err);
    return NextResponse.json({ message: "Failed to fetch expense splits" }, { status: 500 });
  }
}
