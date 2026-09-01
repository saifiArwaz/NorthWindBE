import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as csrGalleryService from "./csrGallery.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const normalizedCategoryId =
    typeof req.body.categoryId === "string" && req.body.categoryId.trim() !== ""
      ? req.body.categoryId.trim()
      : undefined;

  const record = await csrGalleryService.createCsrGallery({
    ...req.body,
    categoryId: normalizedCategoryId,
    files: filesByFieldname,
    createdBy: user?.id,
  });

  if (record && record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(res, 201, "CSR Gallery created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const categoryId = (req.query.categoryId as string) || undefined;

  const records = await csrGalleryService.getAllList(page, limit, search, categoryId);

  await Promise.all(
    records.data.map(async (data: any) => {
      if (data.files && typeof data.files === "object") {
        const filesObj = data.files as any;
        await Promise.all(
          Object.keys(filesObj).map(async (key) => {
            if (filesObj[key]) {
              filesObj[key] = await getFileUrl(filesObj[key]);
            }
          }),
        );
      }
    }),
  );

  successResponse(res, 200, "CSR Gallery records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await csrGalleryService.getCsrGalleryById(id);

  if (!record) {
    throw new ApiError(404, "CSR Gallery not found");
  }

  if (record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(res, 200, "CSR Gallery fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await csrGalleryService.getCsrGalleryById(id);
  if (!oldRecord) {
    throw new ApiError(404, "CSR Gallery record not found");
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  const filesToDelete: string[] = [];

  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        filesToDelete.push(filesByFieldname[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  if (Array.isArray(req.body.removeFiles)) {
    for (const field of req.body.removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  const normalizedCategoryId =
    req.body.categoryId !== undefined
      ? req.body.categoryId && req.body.categoryId.trim() !== ""
        ? req.body.categoryId.trim()
        : null
      : undefined;

  const updatePayload = Object.fromEntries(
    Object.entries({
      title: req.body.title,
      categoryId: normalizedCategoryId,
      link: req.body.link,
      alt: req.body.alt,
      watermark: req.body.watermark,
      files: Object.keys(filesByFieldname).length > 0 ? filesByFieldname : undefined,
      updatedBy: user?.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await csrGalleryService.updateCsrGallery(id, updatePayload);

  for (const fileKey of filesToDelete) {
    await deleteFromS3(fileKey);
  }

  if (updatedRecord && updatedRecord.files && typeof updatedRecord.files === "object") {
    const filesObj = updatedRecord.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(res, 200, "CSR Gallery updated successfully", updatedRecord);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const oldRecord = await csrGalleryService.getCsrGalleryById(id);

  if (!oldRecord) {
    throw new ApiError(404, "CSR Gallery not found");
  }

  if (oldRecord.files && typeof oldRecord.files === "object") {
    for (const key of Object.keys(oldRecord.files as any)) {
      const fileKey = (oldRecord.files as any)[key];
      if (fileKey) {
        await deleteFromS3(fileKey);
      }
    }
  }

  await csrGalleryService.deleteCsrGalleryById(id);
  successResponse(res, 200, "CSR Gallery deleted successfully");
});

export const changeSeq = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const { seq } = req.body;

  if (isNaN(seq)) {
    throw new ApiError(400, "Seq value must be a number");
  }

  const record = await csrGalleryService.getCsrGalleryById(id);
  if (!record) {
    throw new ApiError(404, "CSR Gallery not found");
  }

  const updated = await csrGalleryService.updateSeq(id, {
    seq: Number(seq),
    updatedBy: user?.id,
  });

  successResponse(res, 200, "Sequence updated successfully", updated);
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
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
    status = status === "true" || status === "1";
  } else if (typeof status === "number") {
    status = status === 1;
  }

  const record = await csrGalleryService.getCsrGalleryById(id);
  if (!record) {
    throw new ApiError(404, "CSR Gallery not found");
  }

  const updated = await csrGalleryService.updateStatus(
    id,
    status,
    user?.id,
  );

  successResponse(res, 200, "Status updated successfully", updated);
});

export const destroySinglefile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { fieldname } = req.body;

  const record = await csrGalleryService.getCsrGalleryById(id);
  if (!record) {
    throw new ApiError(404, "CSR Gallery not found");
  }

  const filesObj = (record.files as any) || {};
  if (filesObj[fieldname]) {
    await deleteFromS3(filesObj[fieldname]);
    delete filesObj[fieldname];

    await csrGalleryService.updateCsrGallery(id, {
      files: filesObj,
    });
  }

  successResponse(res, 200, "File deleted successfully");
});
