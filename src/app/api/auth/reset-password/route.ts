import { NextRequest, NextResponse } from "next/server";
import { resetAdminPassword, verifyPasswordResetToken, clearAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Reset token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const verification = verifyPasswordResetToken(token);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error || "Invalid or expired token." }, { status: 400 });
    }

    const result = resetAdminPassword(token, newPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to reset password." }, { status: 400 });
    }

    // Invalidate any existing session cookie
    await clearAdminSession();

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. Please log in with your new credentials.",
    });
  } catch (err: unknown) {
    console.error("[Reset Password API Error]:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
