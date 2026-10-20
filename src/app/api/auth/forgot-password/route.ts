import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const rateCheck = checkRateLimit(`reset_${ip}`, 3, 300000); // 3 attempts per 5 minutes
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many password reset requests. Please wait ${rateCheck.resetInSec} seconds.` },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = getDb();
    const admin = db.prepare("SELECT id, email, name FROM admins WHERE email = ?").get(email.toLowerCase().trim()) as {
      id: string;
      email: string;
      name: string;
    } | undefined;

    let resetToken = "";
    let emailResult = null;

    if (admin) {
      resetToken = createPasswordResetToken(admin.id);
      const origin = req.nextUrl.origin || "http://localhost:3000";
      const resetUrl = `${origin}/admin/reset-password?token=${resetToken}`;

      emailResult = await sendEmail({
        to: admin.email,
        subject: "Snehasish Photography - Administrator Password Reset",
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #191816; background: #FAF7F2; border: 1px solid #E5E0D8;">
            <h2 style="font-size: 24px; margin-bottom: 12px; color: #191816;">Password Reset Request</h2>
            <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #5C5853;">
              Hello ${admin.name},<br/><br/>
              A request was made to reset the administrator password for your portfolio. Click the button below to choose a new password. This link is single-use and will expire in 60 minutes.
            </p>
            <div style="margin: 28px 0;">
              <a href="${resetUrl}" style="background-color: #191816; color: #FAF7F2; padding: 12px 24px; font-family: sans-serif; font-size: 13px; text-decoration: none; display: inline-block; letter-spacing: 0.1em; text-transform: uppercase;">
                Reset Administrator Password
              </a>
            </div>
            <p style="font-family: sans-serif; font-size: 12px; color: #8A857D; margin-top: 24px; border-top: 1px solid #E5E0D8; padding-top: 16px;">
              If you did not request this, please ignore this email. Your current password remains secure.<br/>
              Link: ${resetUrl}
            </p>
          </div>
        `,
        text: `Reset your administrator password by visiting: ${resetUrl}`,
      });
    }

    // Return generic security response
    return NextResponse.json({
      success: true,
      message: "If an administrator account with that email address exists, reset instructions have been dispatched.",
      // Include devToken if email fallback was used so developer/photographer can test right in UI
      devToken: emailResult?.fallbackUsed ? resetToken : undefined,
      devNote: emailResult?.note,
    });
  } catch (err: unknown) {
    console.error("[Forgot Password API Error]:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
