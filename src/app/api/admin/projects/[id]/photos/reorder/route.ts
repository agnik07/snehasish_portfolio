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
    const { id: projectId } = await params;
    const body = await req.json();
    const { photoIds } = body; // Array of photo ids in new desired order

    if (!Array.isArray(photoIds)) {
      return NextResponse.json({ error: "photoIds array is required" }, { status: 400 });
    }

    const db = getDb();
    const updateOrder = db.prepare("UPDATE project_photos SET order_index = ? WHERE id = ? AND project_id = ?");

    const tx = db.transaction(() => {
      photoIds.forEach((photoId, idx) => {
        updateOrder.run(idx + 1, photoId, projectId);
      });
    });

    tx();

    return NextResponse.json({ success: true, message: "Photographs reordered successfully." });
  } catch (err: unknown) {
    console.error("[Reorder Photos Error]:", err);
    return NextResponse.json({ error: "Failed to reorder photographs." }, { status: 500 });
  }
}
