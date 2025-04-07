// models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expenseSplit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpenseSplit",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true,
  },
  method: {
    type: String, // e.g., "PayPal", "Venmo", etc.
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  orderId: {
    type: String,
  }
});

const Activity = mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
export default Activity;
