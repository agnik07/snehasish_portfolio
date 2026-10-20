import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // 1. Site settings
    const settingsRows = db.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    // 2. Active categories ordered
    const categories = db.prepare(`
      SELECT id, name, slug, description, order_index
      FROM categories
      WHERE is_active = 1
      ORDER BY order_index ASC, name ASC
    `).all();

    // 3. Published projects ordered
    const projects = db.prepare(`
      SELECT p.id, p.title, p.slug, p.category_id, p.client_names, p.location, p.shoot_date,
             p.cover_image_url, p.description, p.is_featured, p.order_index, p.created_at,
             c.name as category_name, c.slug as category_slug
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1 AND c.is_active = 1
      ORDER BY p.is_featured DESC, p.order_index ASC, p.created_at DESC
    `).all() as Array<{
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
    }>;

    // Attach photos count and first 3 photo previews for gallery
    const getPhotos = db.prepare(`
      SELECT id, url, caption, alt_text, aspect_ratio, width, height, order_index
      FROM project_photos
      WHERE project_id = ?
      ORDER BY order_index ASC
    `);

    const enrichedProjects = projects.map((p) => {
      const photos = getPhotos.all(p.id);
      return {
        ...p,
        photos,
        photoCount: photos.length,
      };
    });

    // 4. Active services ordered
    const servicesRows = db.prepare(`
      SELECT id, name, slug, description, starting_price, cover_image_url, inclusions, order_index
      FROM services
      WHERE is_active = 1
      ORDER BY order_index ASC
    `).all() as Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      starting_price: string | null;
      cover_image_url: string | null;
      inclusions: string | null;
      order_index: number;
    }>;

    const services = servicesRows.map((s) => ({
      ...s,
      inclusions: s.inclusions ? JSON.parse(s.inclusions) : [],
    }));

    // 5. Testimonials
    const testimonials = db.prepare(`
      SELECT id, client_name, shoot_type, quote, image_url
      FROM testimonials
      WHERE is_published = 1
      ORDER BY order_index ASC
    `).all();

    return NextResponse.json({
      settings,
      categories,
      projects: enrichedProjects,
      services,
      testimonials,
    });
  } catch (err: unknown) {
    console.error("[Public Data API Error]:", err);
    return NextResponse.json({ error: "Failed to load portfolio data." }, { status: 500 });
  }
}
