import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const db = getDb();

    // Fetch project
    const project = db.prepare(`
      SELECT p.id, p.title, p.slug, p.category_id, p.client_names, p.location, p.shoot_date,
             p.cover_image_url, p.description, p.is_featured, p.order_index, p.created_at,
             c.name as category_name, c.slug as category_slug
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_published = 1 AND c.is_active = 1
    `).get(slug) as {
      id: string;
      title: string;
      slug: string;
      category_id: string;
      client_names: string | null;
      location: string | null;
      shoot_date: string | null;
      cover_image_url: string;
      description: string;
      is_featured: number;
      order_index: number;
      created_at: string;
      category_name: string;
      category_slug: string;
    } | undefined;

    if (!project) {
      return NextResponse.json({ error: "Project not found or unpublished." }, { status: 404 });
    }

    // Fetch all photos in curated order
    const photos = db.prepare(`
      SELECT id, url, caption, alt_text, width, height, aspect_ratio, order_index
      FROM project_photos
      WHERE project_id = ?
      ORDER BY order_index ASC
    `).all(project.id);

    // Fetch previous and next published projects for seamless navigation
    const allPublished = db.prepare(`
      SELECT p.id, p.title, p.slug, p.cover_image_url, c.name as category_name
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1 AND c.is_active = 1
      ORDER BY p.order_index ASC, p.created_at DESC
    `).all() as Array<{
      id: string;
      title: string;
      slug: string;
      cover_image_url: string;
      category_name: string;
    }>;

    const currentIndex = allPublished.findIndex((p) => p.slug === slug);
    const prevProject = currentIndex > 0 ? allPublished[currentIndex - 1] : allPublished[allPublished.length - 1];
    const nextProject = currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1] : allPublished[0];

    return NextResponse.json({
      project: {
        ...project,
        photos,
      },
      navigation: {
        prev: prevProject?.slug !== slug ? prevProject : null,
        next: nextProject?.slug !== slug ? nextProject : null,
      },
    });
  } catch (err: unknown) {
    console.error("[Project Detail API Error]:", err);
    return NextResponse.json({ error: "Failed to load project." }, { status: 500 });
  }
}
