import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const rateCheck = checkRateLimit(`inquiry_${ip}`, 5, 600000); // 5 inquiries per 10 minutes
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many submissions. Please wait ${rateCheck.resetInSec} seconds before sending another inquiry.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, shoot_type, preferred_date, location, budget, message } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }
    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (!shoot_type || !shoot_type.trim()) {
      return NextResponse.json({ error: "Please select a shoot type." }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Please provide a brief message about your shoot." }, { status: 400 });
    }

    const db = getDb();
    const inquiryId = `inq_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO inquiries (id, name, email, phone, shoot_type, preferred_date, location, budget, message, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, ?, ?)
    `).run(
      inquiryId,
      name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      shoot_type.trim(),
      preferred_date ? preferred_date.trim() : null,
      location ? location.trim() : null,
      budget ? budget.trim() : null,
      message.trim(),
      now,
      now
    );

    // Retrieve photographer destination email from settings
    const adminEmailRow = db.prepare("SELECT value FROM site_settings WHERE key = 'contact_email'").get() as { value: string } | undefined;
    const destEmail = adminEmailRow?.value || process.env.ADMIN_EMAIL || "contact@snehasishphotography.com";

    // Attempt email dispatch
    const emailRes = await sendEmail({
      to: destEmail,
      subject: `New Booking Inquiry from ${name.trim()} [${shoot_type.trim()}]`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #191816; background: #FAF7F2; border: 1px solid #E5E0D8;">
          <h2 style="font-family: serif; font-size: 24px; margin-bottom: 16px; color: #191816; border-bottom: 1px solid #E5E0D8; padding-bottom: 8px;">
            New Booking Inquiry
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8;">
            <tr><td style="width: 140px; color: #8A857D; font-weight: bold;">Client Name:</td><td>${name.trim()}</td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Email:</td><td><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Phone / WhatsApp:</td><td>${phone ? phone.trim() : "Not provided"}</td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Shoot Type:</td><td>${shoot_type.trim()}</td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Preferred Date:</td><td>${preferred_date ? preferred_date.trim() : "Not specified"}</td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Shoot Location:</td><td>${location ? location.trim() : "Not specified"}</td></tr>
            <tr><td style="color: #8A857D; font-weight: bold;">Approx. Budget:</td><td>${budget ? budget.trim() : "Not specified"}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 4px;">
            <p style="font-weight: bold; margin-bottom: 8px; color: #5C5853;">Client Message:</p>
            <p style="white-space: pre-wrap; font-size: 14px; color: #191816;">${message.trim()}</p>
          </div>
          <p style="font-size: 12px; color: #8A857D; margin-top: 20px;">
            This inquiry has been saved to your Admin Dashboard under Inquiries.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. Your inquiry has been received, and Snehasish will be in touch shortly.",
      inquiryId,
      emailDelivery: {
        attempted: true,
        delivered: emailRes.success && !emailRes.fallbackUsed,
        note: emailRes.note,
      },
    });
  } catch (err: unknown) {
    console.error("[Inquiry API Error]:", err);
    return NextResponse.json({ error: "Unable to submit inquiry at this moment. Please try again or reach out directly via WhatsApp." }, { status: 500 });
  }
}
