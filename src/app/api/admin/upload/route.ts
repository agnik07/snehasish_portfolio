import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isR2Configured, uploadToR2, getPresignedUploadUrl } from "@/lib/r2";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const isVercel = Boolean(process.env.VERCEL);
const LOCAL_UPLOAD_DIR = isVercel
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "public", "uploads");

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Check if client is requesting a presigned R2 upload URL
    if (contentType.includes("application/json")) {
      const jsonBody = await req.json();
      if (jsonBody.action === "presign") {
        if (!isR2Configured()) {
          return NextResponse.json(
            { error: "Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) are not configured." },
            { status: 400 }
          );
        }

        const { filename, fileType } = jsonBody;
        const extension = ALLOWED_MIME_TYPES[fileType] || ".jpg";
        const randomHash = crypto.randomBytes(8).toString("hex");
        const key = `portfolio_${Date.now()}_${randomHash}${extension}`;

        const presigned = await getPresignedUploadUrl({
          key,
          contentType: fileType,
          expiresIn: 300,
        });

        return NextResponse.json({ success: true, ...presigned });
      }
    }

    // 2. Direct Multipart FormData upload
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const uploadedUrls: Array<{
      url: string;
      originalName: string;
      size: number;
      aspect_ratio: string;
      storage: "r2" | "local";
    }> = [];

    const r2Active = isR2Configured();

    if (!r2Active && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    }

    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum allowed size of 25MB.` },
          { status: 400 }
        );
      }

      const mimeType = file.type.toLowerCase();
      const extension = ALLOWED_MIME_TYPES[mimeType];

      if (!extension) {
        return NextResponse.json(
          { error: `File type "${mimeType}" is not supported. Please upload JPEG, PNG, WebP, or AVIF images.` },
          { status: 400 }
        );
      }

      const randomHash = crypto.randomBytes(8).toString("hex");
      const safeFilename = `photo_${Date.now()}_${randomHash}${extension}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (r2Active) {
        // Cloudflare R2 Upload
        const r2Result = await uploadToR2({
          key: safeFilename,
          buffer,
          contentType: mimeType,
        });

        uploadedUrls.push({
          url: r2Result.publicUrl,
          originalName: file.name,
          size: file.size,
          aspect_ratio: "landscape",
          storage: "r2",
        });
      } else {
        // Local Disk / tmp fallback
        const filePath = path.join(LOCAL_UPLOAD_DIR, safeFilename);
        fs.writeFileSync(filePath, buffer);

        const publicUrl = isVercel ? `/uploads/${safeFilename}` : `/uploads/${safeFilename}`;

        uploadedUrls.push({
          url: publicUrl,
          originalName: file.name,
          size: file.size,
          aspect_ratio: "landscape",
          storage: "local",
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
      storage: r2Active ? "cloudflare_r2" : (isVercel ? "serverless_tmp" : "local_public"),
      message: `${uploadedUrls.length} photograph(s) uploaded successfully.`,
    });
  } catch (err: unknown) {
    console.error("[Upload API Error]:", err);
    return NextResponse.json({ error: "Failed to process image upload." }, { status: 500 });
  }
}
