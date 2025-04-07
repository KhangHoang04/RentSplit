import { NextResponse } from "next/server";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";

export async function GET(req, { params }) {
  await connectToDB()

  try {
    const { userId } = params;

    const splits = await ExpenseSplit.find({ user_id: userId }).populate("expense_id");

    return NextResponse.json({ splits });
  } catch (err) {
    console.error("Error fetching ExpenseSplits:", err);
    return NextResponse.json({ message: "Failed to fetch expense splits" }, { status: 500 });
  }
}
