import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

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
    const { caption, alt_text, aspect_ratio } = body;

    const db = getDb();
    const photo = db.prepare("SELECT id FROM project_photos WHERE id = ?").get(id);
    if (!photo) {
      return NextResponse.json({ error: "Photograph not found" }, { status: 404 });
    }

    db.prepare(`
      UPDATE project_photos SET
        caption = COALESCE(?, caption),
        alt_text = COALESCE(?, alt_text),
        aspect_ratio = COALESCE(?, aspect_ratio)
      WHERE id = ?
    `).run(
      caption !== undefined ? caption : null,
      alt_text !== undefined ? alt_text : null,
      aspect_ratio || null,
      id
    );

    return NextResponse.json({ success: true, message: "Photograph updated." });
  } catch (err: unknown) {
    console.error("[Update Photo Error]:", err);
    return NextResponse.json({ error: "Failed to update photograph." }, { status: 500 });
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

    db.prepare("DELETE FROM project_photos WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "Photograph deleted." });
  } catch (err: unknown) {
    console.error("[Delete Photo Error]:", err);
    return NextResponse.json({ error: "Failed to delete photograph." }, { status: 500 });
  }
}
