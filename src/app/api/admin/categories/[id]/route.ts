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
    const { name, slug, description, order_index, is_active } = body;

    const db = getDb();
    const cat = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const cleanSlug = slug
      ? slug.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")
      : null;

    if (cleanSlug) {
      const clash = db.prepare("SELECT id FROM categories WHERE slug = ? AND id != ?").get(cleanSlug, id);
      if (clash) {
        return NextResponse.json({ error: "Another category already uses this slug." }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        order_index = COALESCE(?, order_index),
        is_active = COALESCE(?, is_active),
        updated_at = ?
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      cleanSlug,
      description !== undefined ? description : null,
      order_index !== undefined ? parseInt(order_index, 10) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      now,
      id
    );

    return NextResponse.json({ success: true, message: "Category updated." });
  } catch (err: unknown) {
    console.error("[Update Category Error]:", err);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
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

    // Check if any projects exist under this category
    const projectCount = db.prepare("SELECT COUNT(*) as c FROM projects WHERE category_id = ?").get(id) as { c: number };
    if (projectCount.c > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${projectCount.c} project(s) are currently assigned to it. Reassign or delete those projects first.` },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM categories WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (err: unknown) {
    console.error("[Delete Category Error]:", err);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
