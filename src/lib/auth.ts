import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "snehasish_photography_super_secret_jwt_key_2026_luxury_editorial"
);

const COOKIE_NAME = "snehasish_admin_session";
const TOKEN_EXPIRY_DAYS = 7;

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}

export async function createAdminSession(admin: AdminPayload): Promise<string> {
  const token = await new SignJWT({
    id: admin.id,
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email) return null;

    // Double check admin still exists in db
    const db = getDb();
    const admin = db.prepare("SELECT id, email, name FROM admins WHERE id = ?").get(payload.id as string) as AdminPayload | undefined;
    if (!admin) return null;

    return admin;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, passwordPlain: string): Promise<AdminPayload | null> {
  const db = getDb();
  const row = db.prepare("SELECT id, email, password_hash, name FROM admins WHERE email = ?").get(email.toLowerCase()) as {
    id: string;
    email: string;
    password_hash: string;
    name: string;
  } | undefined;

  if (!row) return null;

  const valid = await bcrypt.compare(passwordPlain, row.password_hash);
  if (!valid) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, 12);
}

// Generate single-use password reset token
export function createPasswordResetToken(adminId: string): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  const db = getDb();
  // Clear any existing unused tokens for this admin
  db.prepare("DELETE FROM password_resets WHERE admin_id = ?").run(adminId);

  db.prepare(`
    INSERT INTO password_resets (token_hash, admin_id, expires_at, used, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(tokenHash, adminId, expiresAt, new Date().toISOString());

  return rawToken;
}

// Verify reset token
export function verifyPasswordResetToken(rawToken: string): { valid: boolean; adminId?: string; error?: string } {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const db = getDb();

  const record = db.prepare(`
    SELECT admin_id, expires_at, used FROM password_resets WHERE token_hash = ?
  `).get(tokenHash) as { admin_id: string; expires_at: string; used: number } | undefined;

  if (!record) {
    return { valid: false, error: "Invalid or expired password reset token." };
  }

  if (record.used === 1) {
    return { valid: false, error: "This password reset token has already been used." };
  }

  const now = new Date();
  if (now > new Date(record.expires_at)) {
    return { valid: false, error: "This password reset token has expired. Please request a new one." };
  }

  return { valid: true, adminId: record.admin_id };
}

// Execute password reset
export function resetAdminPassword(rawToken: string, newPasswordPlain: string): { success: boolean; error?: string } {
  const verification = verifyPasswordResetToken(rawToken);
  if (!verification.valid || !verification.adminId) {
    return { success: false, error: verification.error || "Token verification failed." };
  }

  if (newPasswordPlain.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const newHash = hashPassword(newPasswordPlain);
  const now = new Date().toISOString();

  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?").run(
      newHash,
      now,
      verification.adminId
    );
    db.prepare("UPDATE password_resets SET used = 1 WHERE token_hash = ?").run(tokenHash);
  });

  tx();

  return { success: true };
}
