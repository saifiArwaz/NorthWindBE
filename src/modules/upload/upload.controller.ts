import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js"; // adjust the path as needed

export const uploadSingle = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req.file as
      | (Express.Multer.File & { key?: string; location?: string })
      | undefined;

    if (!file) {
      throw new ApiError(400, "No file uploaded");
    }

    const location = file.location;
    const s3Key = file.key;

    if (!location || !s3Key) {
      throw new ApiError(500, "File upload failed (missing S3 info)");
    }

    // const fullUrl = await getFileUrl(s3Key);

    successResponse(res, 200, "File uploaded successfully", {
      url: s3Key,
    });
  },
);
