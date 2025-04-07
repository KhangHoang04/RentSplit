// lib/email/sendInviteEmail.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({ to, inviter, householdName }) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${inviter} invited you to join ${householdName} on RentSplit`,
      html: `
        <h2>You’ve been invited!</h2>
        <p>${inviter} invited you to join <strong>${householdName}</strong> on RentSplit.</p>
        <p><a href="http://localhost:3000">Join Now</a></p>
      `,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }
}
