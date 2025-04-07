import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import Household from "@/core/models/Household";

export async function POST(req, { params }) {
  await connectToDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: householdId, expenseId } = params;
  const { amount, category, paid_by, date } = await req.json();

  if (!amount || !category || !paid_by || !date) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    if (expense.paid_by.toString() !== paid_by) {
      return NextResponse.json({ message: "Only the payer can update this expense" }, { status: 403 });
    }

    expense.amount = amount;
    expense.category = category;
    expense.date = date;
    await expense.save();

    await ExpenseSplit.deleteMany({ expense_id: expense._id });

    const household = await Household.findById(householdId).populate("members").populate("admin");
    const allUsers = [...household.members.map(m => m._id.toString()), household.admin._id.toString()];
    const filteredUsers = allUsers.filter(uid => uid !== paid_by);
    const share = parseFloat((amount / allUsers.length).toFixed(2));

    await Promise.all(
      filteredUsers.map(uid =>
        ExpenseSplit.create({
          expense_id: expense._id,
          user_id: uid,
          amount: share,
          date: new Date(date)
        })
      )
    );

    return NextResponse.json({ message: "Expense updated", expense }, { status: 200 });
  } catch (err) {
    console.error("[Update Expense Error]", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
