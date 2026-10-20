import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId } = await params;
    const db = getDb();

    const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const photos = Array.isArray(body.photos) ? body.photos : [body];

    if (photos.length === 0) {
      return NextResponse.json({ error: "No photographs provided." }, { status: 400 });
    }

    const maxOrder = db.prepare("SELECT COALESCE(MAX(order_index), 0) as max_idx FROM project_photos WHERE project_id = ?").get(projectId) as { max_idx: number };
    let currentIdx = maxOrder.max_idx;

    const now = new Date().toISOString();
    const insertPhoto = db.prepare(`
      INSERT INTO project_photos (id, project_id, url, caption, alt_text, width, height, aspect_ratio, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertedIds: string[] = [];
    const tx = db.transaction(() => {
      for (const p of photos) {
        if (!p.url) continue;
        currentIdx += 1;
        const photoId = `photo_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        insertPhoto.run(
          photoId,
          projectId,
          p.url,
          p.caption || null,
          p.alt_text || null,
          p.width || 1600,
          p.height || 1067,
          p.aspect_ratio || "landscape",
          currentIdx,
          now
        );
        insertedIds.push(photoId);
      }
    });

    tx();

    return NextResponse.json({
      success: true,
      message: `${insertedIds.length} photo(s) added to project.`,
      photoIds: insertedIds,
    });
  } catch (err: unknown) {
    console.error("[Add Photos Error]:", err);
    return NextResponse.json({ error: "Failed to add photographs." }, { status: 500 });
  }
}
