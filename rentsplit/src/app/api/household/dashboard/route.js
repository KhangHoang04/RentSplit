import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import ExpenseSplit from "@/core/models/ExpensesSplit";
import { UserModel } from "@/core/models/User";

export async function GET() {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await UserModel.findOne({ email: session.user.email });

    if (!sessionUser) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    // Step 1: Get all households user is involved in
    const households = await Household.find({
      $or: [{ members: sessionUser._id }, { admin: sessionUser._id }],
    })
      .populate("admin", "username email profileImage")
      .populate("members", "username email profileImage")
      .lean();

    // Step 2: Aggregate total owed to sessionUser PER household per user
    const owedAggregates = await ExpenseSplit.aggregate([
      {
        $match: {
          paid_to: sessionUser._id,
          status: "Pending",
        },
      },
      {
        $group: {
          _id: {
            household_id: "$household_id",
            user_id: "$user_id",
          },
          totalOwed: { $sum: "$amount" },
        },
      },
    ]);

    // Step 3: Convert into lookup: { [householdId_userId]: amount }
    const owedMap = {};
    owedAggregates.forEach(({ _id, totalOwed }) => {
      const key = `${_id.household_id}_${_id.user_id}`;
      owedMap[key] = totalOwed;
    });

    // Step 4: Enrich each household with how much each member owes the current user
    const enrichedHouseholds = households.map((household) => {
      const householdId = household._id.toString();
      return {
        ...household,
        members: household.members.map((member) => {
          const memberId = member._id.toString();
          const key = `${householdId}_${memberId}`;
          return {
            ...member,
            amountOwedToCurrentUser: owedMap[key] || 0,
          };
        }),
      };
    });

    return NextResponse.json({ households: enrichedHouseholds }, { status: 200 });
  } catch (error) {
    console.error("[Get Households Error]", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
