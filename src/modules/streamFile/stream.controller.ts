import { Request, Response } from "express";
import * as s3Service from "./stream.service.js";
import { prisma } from "../../config/prisma.config.js";
import { ApiError } from "../../utils/apiError.utils.js";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../config/s3.config.js";
const Bucket = process.env.AWS_S3_BUCKET!;

/* -----------------------------
   Multipart start
----------------------------- */
export const startMultipart = async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;

  const command = new CreateMultipartUploadCommand({
    Bucket,
    Key: `${Date.now()}-${fileName}`,
    ContentType: fileType,
  });

  const response = await s3.send(command);
  res.json({
    uploadId: response.UploadId,
    key: response.Key,
  });
};

/* -----------------------------
   Get part url
----------------------------- */
export const getPartUrl = async (req: Request, res: Response) => {
  const { uploadId, partNumber, key } = req.query;

  const contentLength = req.headers["content-length"];
  if (!contentLength) {
    return res.status(400).json({ error: "Missing Content-Length header" });
  }
  const body = req; // the chunk body
  const command = new UploadPartCommand({
    Bucket,
    Key: key as string,
    PartNumber: Number(partNumber),
    UploadId: uploadId as string,
    Body: body,
    ContentLength: Number(contentLength), // ✅ FIX
  });
  const response = await s3.send(command);
  res.json({
    ETag: response.ETag,
    PartNumber: Number(partNumber),
  });
};

/* -----------------------------
   Complete upload
----------------------------- */
export const completeMultipart = async (req: Request, res: Response) => {
  const { uploadId, key, parts } = req.body;

  const command = new CompleteMultipartUploadCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts, // [{ETag, PartNumber}, ...]
    },
  });

  const response = await s3.send(command);
  res.json({
    location: response.Location,
    key: response.Key,
  });
};
