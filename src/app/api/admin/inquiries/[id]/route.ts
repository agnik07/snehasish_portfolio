import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();
    const inquiry = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (err: unknown) {
    console.error("[Get Inquiry Detail Error]:", err);
    return NextResponse.json({ error: "Failed to fetch inquiry." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const db = getDb();
    const existing = db.prepare("SELECT id FROM inquiries WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const validStatuses = ["new", "contacted", "booked", "archived"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE inquiries SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?
    `).run(status || null, notes !== undefined ? notes : null, now, id);

    return NextResponse.json({ success: true, message: "Inquiry updated." });
  } catch (err: unknown) {
    console.error("[Update Inquiry Error]:", err);
    return NextResponse.json({ error: "Failed to update inquiry." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "Inquiry deleted." });
  } catch (err: unknown) {
    console.error("[Delete Inquiry Error]:", err);
    return NextResponse.json({ error: "Failed to delete inquiry." }, { status: 500 });
  }
}
