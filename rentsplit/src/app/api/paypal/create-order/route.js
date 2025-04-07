// app/api/paypal/create-order/route.js

import { ordersController } from "@/core/lib/paypal";
import { NextResponse } from "next/server"; 
import connectToDB from "@/core/db/mongodb"; 
import Activity from "@/core/models/Activity";
import { UserModel } from "@/core/models/User";

export async function POST(req) { 
  try { await connectToDB(); 
    const { payerId, receiverId, expenseSplitId, amount, householdId } = await req.json();
    const collect = {
      body: {
        intent: "CAPTURE",
        applicationContext: {
          returnUrl: "http://localhost:3000/paypal", // ✅ Replace with your app’s domain
        },
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: amount.toFixed(2),
              breakdown: {
                itemTotal: {
                  currencyCode: "USD",
                  value: amount.toFixed(2),
                },
              },
            },
            items: [
              {
                name: "Expense Reimbursement",
                unitAmount: {
                  currencyCode: "USD",
                  value: amount.toFixed(2),
                },
                quantity: "1",
                description: "Payment to settle split expense",
                sku: expenseSplitId,
              },
            ],
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, statusCode } = await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(body);

    // Log as pending activity
    await Activity.create({
      payer: payerId,
      receiver: receiverId,
      expenseSplit: expenseSplitId,
      amount,
      household: householdId,
      method: "PayPal",
      status: "Pending",
      orderId: jsonResponse.id
    });
  return NextResponse.json(jsonResponse, { status: statusCode });
  } catch (error) { 
    console.error("Create Order Error:", error); 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  } 
}