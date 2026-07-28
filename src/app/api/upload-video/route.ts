import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/require-admin";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
};

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const contentType = body?.contentType;
  const size = body?.size;

  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return NextResponse.json({ error: "Video harus format MP4" }, { status: 400 });
  }

  if (typeof size !== "number" || size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Ukuran video maksimal 100MB" }, { status: 400 });
  }

  const key = `${randomUUID()}.${ext}`;

  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 600 }
  );

  return NextResponse.json({ uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` }, { status: 201 });
}
