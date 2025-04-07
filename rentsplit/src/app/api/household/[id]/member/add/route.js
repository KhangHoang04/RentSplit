// app/api/household/[id]/add/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";
import sgMail from "@sendgrid/mail";


export async function POST(req, { params }) {
  await connectToDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sessionUser = await UserModel.findOne({ email: session.user.email });
  if (!sessionUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const { email, householdName } = await req.json();
  const householdId = params?.id;
  if (!householdId) return NextResponse.json({ message: "Household ID missing" }, { status: 400 });
  try {
    let user = await UserModel.findOne({ email });

    // Invite new user if not exists
    if (!user) {
      user = await UserModel.create({
        email,
        name: email.split("@")[0],
        status: "invited",
      });
      const html = `
        <h2>You’ve been invited!</h2>
        <p>${sessionUser.username} invited you to join <strong>${householdName}</strong> on RentSplit.</p>
        <p><a href="http://localhost:3000">Join Now!!! (Click on link 😉)</a></p>
        `;
      
        const msg = {
        to: email,
        from: "allyhoang24@gmail.com",
        subject: `${sessionUser.username} has invited you to Rentsplit!`,
        text: `${sessionUser.username} invited you to join ${householdName} on RentSplit. Visit http://localhost:3000 to join.`,
        html: html,
        };
      
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
    }

    const household = await Household.findById(householdId);
    if (!household) return NextResponse.json({ message: "Household not found" }, { status: 404 });

    // Only admin can add
    if (!household.admin.equals(sessionUser._id)) {
      return NextResponse.json({ message: "Only admin can add members" }, { status: 403 });
    }

    // Avoid duplicates
    if (!household.members.includes(user._id)) {
      household.members.push(user._id);
      await household.save();
    }

    return NextResponse.json({ message: "Member added", userId: user._id });
  } catch (err) {
    console.error("[Add Member Error]", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
