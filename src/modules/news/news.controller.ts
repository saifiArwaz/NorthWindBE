import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as newsServices from "./news.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const file = req.file as any;

  const record = await newsServices.createNews({
    ...req.body,
    logo: file ? file?.key : "",
    dateAt: new Date(req.body.dateAt),
    createdBy: user?.id,
  });

  if (record?.logo) {
    record.logo = await getFileUrl(record.logo);
  }

  successResponse(res, 200, "News created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await newsServices.getAllList(page, limit, search);

  await Promise.all(
    records.data.map(async (data: any) => {
      if (data.logo) {
        data.logo = await getFileUrl(data.logo);
      }
    }),
  );

  successResponse(res, 200, "News records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await newsServices.getNewsById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  if (record?.logo) {
    record.logo = await getFileUrl(record.logo);
  }

  successResponse(res, 200, "Get edit News record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const oldRecord = await newsServices.getNewsById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** Single file handling for icon */
  let logoKey = oldRecord.logo || null;
  const filesToDelete: string[] = [];

  // Check if a file was uploaded (multer's single file in req.file)
  const uploadedFile = req.file as any;
  if (uploadedFile && uploadedFile.key) {
    if (logoKey) {
      filesToDelete.push(logoKey);
    }
    logoKey = uploadedFile.key;
  }

  // Explicit removal via body.removeIcon (frontend sends removeIcon: true)
  if (req.body.removeIcon) {
    if (logoKey) {
      filesToDelete.push(logoKey);
    }
    logoKey = null;
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      title: req.body.title,
      logo: logoKey,
      alt: req.body.alt,
      watermark: req.body.watermark,
      newsLink: req.body.newsLink,
      dateAt: req.body.dateAt ? new Date(req.body.dateAt) : null,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );
  const updatedRecord = await newsServices.updateNews(id, updatePayload);
  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }
  if (updatedRecord?.logo) {
    updatedRecord.logo = await getFileUrl(updatedRecord.logo);
  }

  successResponse(res, 200, "News updated successfully", updatedRecord);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await newsServices.getNewsById(id);

  if (!item) {
    throw new ApiError(404, "News record not found");
  }

  // if (item.logo) {
  //      await deleteFromS3(item.logo);
  // }

  await newsServices.deleteNews(id);
  successResponse(res, 200, "News record deleted successfully");
});

export const changeStatus = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { status } = req.body;

    if (
      !(
        typeof status === "boolean" ||
        status === "true" ||
        status === "false" ||
        status === 1 ||
        status === 0 ||
        status === "1" ||
        status === "0"
      )
    ) {
      throw new ApiError(
        400,
        "status value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof status === "string") {
      if (status === "true") status = true;
      else if (status === "false") status = false;
      else if (status === "1") status = true;
      else if (status === "0") status = false;
    } else if (typeof status === "number") {
      status = status === 1;
    }

    const record = (newsServices as any).getById
      ? await (newsServices as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (newsServices as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
