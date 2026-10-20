import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    const publishedCount = db.prepare("SELECT COUNT(*) as c FROM projects WHERE is_published = 1").get() as { c: number };
    const draftCount = db.prepare("SELECT COUNT(*) as c FROM projects WHERE is_published = 0").get() as { c: number };
    const photoCount = db.prepare("SELECT COUNT(*) as c FROM project_photos").get() as { c: number };
    const newInquiriesCount = db.prepare("SELECT COUNT(*) as c FROM inquiries WHERE status = 'new'").get() as { c: number };
    const totalInquiriesCount = db.prepare("SELECT COUNT(*) as c FROM inquiries").get() as { c: number };

    const recentInquiries = db.prepare(`
      SELECT id, name, email, phone, shoot_type, preferred_date, location, budget, message, status, created_at
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    const recentProjects = db.prepare(`
      SELECT p.id, p.title, p.slug, p.cover_image_url, p.is_published, p.is_featured, p.created_at,
             c.name as category_name
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.updated_at DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      stats: {
        publishedProjects: publishedCount.c,
        draftProjects: draftCount.c,
        totalPhotographs: photoCount.c,
        newInquiries: newInquiriesCount.c,
        totalInquiries: totalInquiriesCount.c,
      },
      recentInquiries,
      recentProjects,
    });
  } catch (err: unknown) {
    console.error("[Admin Overview API Error]:", err);
    return NextResponse.json({ error: "Failed to load dashboard metrics." }, { status: 500 });
  }
}
