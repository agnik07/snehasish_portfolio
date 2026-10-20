import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    const services = db.prepare("SELECT * FROM services ORDER BY order_index ASC").all();
    const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY order_index ASC").all();

    return NextResponse.json({ settings, services, testimonials });
  } catch (err: unknown) {
    console.error("[Get Settings Error]:", err);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { settings, services, testimonials } = body;

    const db = getDb();
    const tx = db.transaction(() => {
      // 1. Update settings
      if (settings && typeof settings === "object") {
        const upsert = db.prepare(`
          INSERT INTO site_settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);
        for (const [k, v] of Object.entries(settings)) {
          upsert.run(k, String(v));
        }
      }

      // 2. Update services if provided
      if (Array.isArray(services)) {
        const updateService = db.prepare(`
          UPDATE services SET
            name = ?,
            description = ?,
            starting_price = ?,
            cover_image_url = ?,
            inclusions = ?,
            is_active = ?,
            updated_at = ?
          WHERE id = ?
        `);
        const now = new Date().toISOString();
        for (const s of services) {
          updateService.run(
            s.name,
            s.description,
            s.starting_price,
            s.cover_image_url,
            typeof s.inclusions === "string" ? s.inclusions : JSON.stringify(s.inclusions || []),
            s.is_active ? 1 : 0,
            now,
            s.id
          );
        }
      }

      // 3. Update testimonials if provided
      if (Array.isArray(testimonials)) {
        const updateTestimonial = db.prepare(`
          UPDATE testimonials SET
            client_name = ?,
            shoot_type = ?,
            quote = ?,
            is_published = ?
          WHERE id = ?
        `);
        for (const t of testimonials) {
          updateTestimonial.run(
            t.client_name,
            t.shoot_type,
            t.quote,
            t.is_published ? 1 : 0,
            t.id
          );
        }
      }
    });

    tx();

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (err: unknown) {
    console.error("[Update Settings Error]:", err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
