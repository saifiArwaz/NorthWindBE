import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../config/s3.config.js";

const Bucket = process.env.AWS_S3_BUCKET!;

export async function createMultipart(filename: string, type: string) {
  const key = `${Date.now()}-${filename}`;
  const res = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket,
      Key: key,
      ContentType: type,
    }),
  );

  return {
    uploadId: res.UploadId!,
    key,
  };
}

export async function getPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
) {
  const command = new UploadPartCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return url;
  // const response = await s3.send(command);
  // return {
  //      ETag: response.ETag,
  //      PartNumber: Number(partNumber),
  // };
}

export async function completeMultipart(
  key: string,
  uploadId: string,
  parts: any[],
) {
  const command = new CompleteMultipartUploadCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  const response = await s3.send(command);

  return {
    location: response.Location,
    key: response.Key,
  };
}
