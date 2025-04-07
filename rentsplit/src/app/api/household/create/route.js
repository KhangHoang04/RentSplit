// app/api/household/create/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/core/db/mongodb";
import Household from "@/core/models/Household";
import { UserModel } from "@/core/models/User";
import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await UserModel.findOne({ email: session.user.email });

    if (!sessionUser) {
    return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    const body = await req.json();
    const { name, groupPhoto, members } = body;

    const memberIds = [];

    for (const email of members) {
      let user = await UserModel.findOne({ email });

      if (!user) {
        user = await UserModel.create({
          email,
          name: email.split("@")[0],
          status: "invited",
        });

        const html = `
        <h2>You’ve been invited!</h2>
        <p>${sessionUser.username} invited you to join <strong>${name}</strong> on RentSplit.</p>
        <p><a href="http://localhost:3000">Join Now!!! (Click on link 😉)</a></p>
        `;

        const msg = {
        to: email,
        from: "allyhoang24@gmail.com",
        subject: `${sessionUser.username} has invited you to Rentsplit!`,
        text: `${sessionUser.username} invited you to join ${name} on RentSplit. Visit http://localhost:3000 to join.`,
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
      memberIds.push(user._id);
    }

    const household = await Household.create({
      name,
      groupPhoto,
      admin: sessionUser._id,
      members: memberIds,
    });

    return NextResponse.json({ message: "Household created", household }, { status: 201 });
  } catch (error) {
    console.error("[Create Household Error]", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
