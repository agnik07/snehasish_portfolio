import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export async function uploadToR2({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ publicUrl: string; key: string }> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    throw new Error("Cloudflare R2 credentials are not configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  const publicUrlBase = process.env.R2_PUBLIC_URL
    ? process.env.R2_PUBLIC_URL.replace(/\/$/, "")
    : `https://${bucketName}.r2.dev`;

  return {
    publicUrl: `${publicUrlBase}/${key}`,
    key,
  };
}

export async function getPresignedUploadUrl({
  key,
  contentType,
  expiresIn = 300,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    throw new Error("Cloudflare R2 credentials are not configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  const publicUrlBase = process.env.R2_PUBLIC_URL
    ? process.env.R2_PUBLIC_URL.replace(/\/$/, "")
    : `https://${bucketName}.r2.dev`;

  return {
    uploadUrl,
    publicUrl: `${publicUrlBase}/${key}`,
    key,
  };
}
