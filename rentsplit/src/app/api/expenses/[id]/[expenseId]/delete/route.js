import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Expense from "@/core/models/Expenses";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import { UserModel } from "@/core/models/User";

export async function DELETE(_req, { params }) {
  await connectToDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: householdId, expenseId } = params;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return NextResponse.json({ message: "Expense not found" }, { status: 404 });

    const sessionUserId = session.user._id || (await UserModel.findOne({ email: session.user.email }))._id.toString();
    if (expense.paid_by.toString() !== sessionUserId) {
      return NextResponse.json({ message: "Only the payer can delete this expense" }, { status: 403 });
    }

    await Expense.deleteOne({ _id: expenseId });
    await ExpenseSplit.deleteMany({ expense_id: expenseId });

    return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("[Delete Expense Error]", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
