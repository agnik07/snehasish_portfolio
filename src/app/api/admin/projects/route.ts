import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const projects = db.prepare(`
      SELECT p.id, p.title, p.slug, p.category_id, p.client_names, p.location, p.shoot_date,
             p.cover_image_url, p.description, p.is_featured, p.is_published, p.order_index,
             p.created_at, p.updated_at,
             c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM project_photos pp WHERE pp.project_id = p.id) as photo_count
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.order_index ASC, p.created_at DESC
    `).all();

    return NextResponse.json({ projects });
  } catch (err: unknown) {
    console.error("[Admin Projects List Error]:", err);
    return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Project title is required." }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }
    if (!cover_image_url) {
      return NextResponse.json({ error: "Cover image is required." }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const db = getDb();

    // Check slug uniqueness
    const existing = db.prepare("SELECT id FROM projects WHERE slug = ?").get(cleanSlug);
    if (existing) {
      return NextResponse.json({ error: "A project with this URL slug already exists. Please choose a different title or slug." }, { status: 400 });
    }

    const projectId = `proj_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (
        id, title, slug, category_id, client_names, location, shoot_date,
        cover_image_url, description, is_featured, is_published, order_index, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      title.trim(),
      cleanSlug,
      category_id,
      client_names ? client_names.trim() : null,
      location ? location.trim() : null,
      shoot_date ? shoot_date.trim() : null,
      cover_image_url.trim(),
      description ? description.trim() : "",
      is_featured ? 1 : 0,
      is_published !== undefined ? (is_published ? 1 : 0) : 1,
      order_index ? parseInt(order_index, 10) : 0,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      project: { id: projectId, slug: cleanSlug },
      message: "Project created successfully.",
    });
  } catch (err: unknown) {
    console.error("[Create Project Error]:", err);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
