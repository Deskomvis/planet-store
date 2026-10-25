import { S3Client } from "@aws-sdk/client-s3";

export const R2_BUCKET = process.env.R2_BUCKET_NAME as string;

const configuredPublicUrl = (process.env.R2_PUBLIC_URL || "https://cdn.roketmedia.id")
  .replace(/\/+$/, "");

// The old public hostname no longer resolves. Keep uploads on the active R2
// custom domain even if a deployment still has the previous value configured.
export const R2_PUBLIC_URL = configuredPublicUrl.replace(
  /^https:\/\/cdn\.creaxvo\.com$/i,
  "https://cdn.roketmedia.id"
);

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});
