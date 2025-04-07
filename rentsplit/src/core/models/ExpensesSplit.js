import mongoose from "mongoose";

const ExpenseSplitSchema = new mongoose.Schema({
  expense_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paid_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  household_id : {
    type: mongoose.Schema.Types.ObjectId,
        ref: "Household",
        required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  due_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
});

const ExpenseSplit = mongoose.models.ExpenseSplit || mongoose.model("ExpenseSplit", ExpenseSplitSchema);
export default ExpenseSplit;
