import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  household_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
export default Expense;
