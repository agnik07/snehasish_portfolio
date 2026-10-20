import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    const db = getDb();
    let sql = "SELECT * FROM inquiries WHERE 1=1";
    const params: (string | number)[] = [];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }

    if (query && query.trim()) {
      sql += " AND (name LIKE ? OR email LIKE ? OR location LIKE ? OR shoot_type LIKE ?)";
      const like = `%${query.trim()}%`;
      params.push(like, like, like, like);
    }

    sql += " ORDER BY created_at DESC";

    const inquiries = db.prepare(sql).all(...params);

    const counts = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_count,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_count,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count
      FROM inquiries
    `).get() as {
      total: number;
      new_count: number;
      contacted_count: number;
      booked_count: number;
      archived_count: number;
    };

    return NextResponse.json({
      inquiries,
      counts: {
        total: counts.total || 0,
        new: counts.new_count || 0,
        contacted: counts.contacted_count || 0,
        booked: counts.booked_count || 0,
        archived: counts.archived_count || 0,
      },
    });
  } catch (err: unknown) {
    console.error("[Get Inquiries Error]:", err);
    return NextResponse.json({ error: "Failed to fetch inquiries." }, { status: 500 });
  }
}
