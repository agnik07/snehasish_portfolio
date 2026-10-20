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

    const project = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const photos = db.prepare(`
      SELECT * FROM project_photos
      WHERE project_id = ?
      ORDER BY order_index ASC
    `).all(id);

    return NextResponse.json({ project: { ...(project as object), photos } });
  } catch (err: unknown) {
    console.error("[Get Project Detail Error]:", err);
    return NextResponse.json({ error: "Failed to fetch project details." }, { status: 500 });
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
    const {
      title,
      slug,
      category_id,
      client_names,
      location,
      shoot_date,
      cover_image_url,
      description,
      is_featured,
      is_published,
      order_index,
    } = body;

    const db = getDb();
    const existing = db.prepare("SELECT id, slug FROM projects WHERE id = ?").get(id) as { id: string; slug: string } | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const cleanSlug = (slug || existing.slug)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug collision
    const slugClash = db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?").get(cleanSlug, id);
    if (slugClash) {
      return NextResponse.json({ error: "Another project with this slug already exists." }, { status: 400 });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE projects SET
        title = COALESCE(?, title),
        slug = ?,
        category_id = COALESCE(?, category_id),
        client_names = ?,
        location = ?,
        shoot_date = ?,
        cover_image_url = COALESCE(?, cover_image_url),
        description = COALESCE(?, description),
        is_featured = COALESCE(?, is_featured),
        is_published = COALESCE(?, is_published),
        order_index = COALESCE(?, order_index),
        updated_at = ?
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      cleanSlug,
      category_id || null,
      client_names !== undefined ? (client_names ? client_names.trim() : null) : null,
      location !== undefined ? (location ? location.trim() : null) : null,
      shoot_date !== undefined ? (shoot_date ? shoot_date.trim() : null) : null,
      cover_image_url ? cover_image_url.trim() : null,
      description !== undefined ? description : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_published !== undefined ? (is_published ? 1 : 0) : null,
      order_index !== undefined ? parseInt(order_index, 10) : null,
      now,
      id
    );

    return NextResponse.json({ success: true, message: "Project updated successfully." });
  } catch (err: unknown) {
    console.error("[Update Project Error]:", err);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
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

    // Cascades delete of project_photos via FOREIGN KEY constraint
    const tx = db.transaction(() => {
      db.prepare("DELETE FROM project_photos WHERE project_id = ?").run(id);
      db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    });

    tx();

    return NextResponse.json({ success: true, message: "Project deleted successfully." });
  } catch (err: unknown) {
    console.error("[Delete Project Error]:", err);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}
