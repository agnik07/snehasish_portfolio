import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const uploadedUrls: Array<{
      url: string;
      originalName: string;
      size: number;
      aspect_ratio: string;
    }> = [];

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds maximum allowed size of 15MB.` }, { status: 400 });
      }

      const mimeType = file.type.toLowerCase();
      const extension = ALLOWED_MIME_TYPES[mimeType];

      if (!extension) {
        return NextResponse.json({
          error: `File type "${mimeType}" is not supported. Please upload JPEG, PNG, WebP, or AVIF images.`
        }, { status: 400 });
      }

      const randomHash = crypto.randomBytes(8).toString("hex");
      const timestamp = Date.now();
      const safeFilename = `photo_${timestamp}_${randomHash}${extension}`;
      const filePath = path.join(UPLOAD_DIR, safeFilename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeFilename}`;

      uploadedUrls.push({
        url: publicUrl,
        originalName: file.name,
        size: file.size,
        aspect_ratio: "landscape", // default
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
      message: `${uploadedUrls.length} photograph(s) uploaded successfully.`,
    });
  } catch (err: unknown) {
    console.error("[Upload API Error]:", err);
    return NextResponse.json({ error: "Failed to process image upload." }, { status: 500 });
  }
}
