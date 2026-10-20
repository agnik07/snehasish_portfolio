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
    const categories = db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM projects p WHERE p.category_id = c.id) as project_count
      FROM categories c
      ORDER BY c.order_index ASC, c.name ASC
    `).all();

    return NextResponse.json({ categories });
  } catch (err: unknown) {
    console.error("[Get Categories Error]:", err);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, order_index } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const db = getDb();
    const existing = db.prepare("SELECT id FROM categories WHERE slug = ? OR name = ?").get(cleanSlug, name.trim());
    if (existing) {
      return NextResponse.json({ error: "A category with this name or slug already exists." }, { status: 400 });
    }

    const catId = `cat_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, order_index, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      catId,
      name.trim(),
      cleanSlug,
      description ? description.trim() : null,
      order_index ? parseInt(order_index, 10) : 10,
      now,
      now
    );

    return NextResponse.json({ success: true, message: "Category created.", categoryId: catId });
  } catch (err: unknown) {
    console.error("[Create Category Error]:", err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
