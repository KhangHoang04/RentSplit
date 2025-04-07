// app/api/paypal/capture-order/[orderID]/route.js

import { ordersController } from "@/core/lib/paypal";
import { NextResponse } from "next/server";
import connectToDB from "@/core/db/mongodb";
import Activity from "@/core/models/Activity";
import ExpenseSplit from "@/core/models/ExpensesSplit";

export async function POST(_req, {params}) {
  try {
    await connectToDB();

    const { orderId } = params;

    const collect = {
      id: orderId,
      prefer: "return=minimal",
    };

    const { body, statusCode } = await ordersController.captureOrder(collect);
    const response = JSON.parse(body);

    // ✅ Update Activity where orderId matches
    const updateResult = await Activity.findOneAndUpdate(
      { orderId: orderId },
      { $set: { status: "Completed", date: new Date() } },
      { new: true }
    );

    if (!updateResult) {
      console.warn(`No matching activity found for orderId: ${orderID}`);
    } else {
      // Also update the ExpenseSplit status to Paid
      await ExpenseSplit.findByIdAndUpdate(updateResult.expenseSplit, {
        $set: { status: "Paid" },
      });
    }
    if (!updateResult) {
      console.warn(`No matching activity found for orderId: ${orderID}`);
    }

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("Capture Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
