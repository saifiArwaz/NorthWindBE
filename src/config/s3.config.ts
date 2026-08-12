process.env.AWS_REQUEST_CHECKSUM_CALCULATION = "WHEN_REQUIRED";
process.env.AWS_RESPONSE_CHECKSUM_VALIDATION = "WHEN_REQUIRED";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION! || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface StorageConfig {
  enabled: boolean;
  bucket?: string;
  region?: string;
}

export const s3Config: StorageConfig = {
  enabled: Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION,
  ),
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
};
