import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as mediaKitService from "./mediaKit.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import type { S3UploadedFile } from "../../middlewares/multer-s3.middleware.js";

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

  const logo = allFiles.find((f: any) => f.fieldname === "logo")?.key || null;

  const listKit = req.body.listKit || [];

  allFiles.forEach((file) => {
    const match = file.fieldname.match(/^listKit\[(\d+)\]\[file\]$/);
    if (!match) return;

    const index = parseInt(match[1], 10);

    if (!listKit[index]) {
      listKit[index] = {};
    }

    listKit[index].file = file.key;
  });

  const record = await mediaKitService.createMediaKit({
    ...req.body,
    logo: logo,
    type: req.body.type,
    createdBy: user?.id,
  });

  if (record) {
    record.logo = record.logo ? await getFileUrl(record.logo) : null;

    if (Array.isArray(record.listKit)) {
      record.listKit = await Promise.all(
        record.listKit.map(async (item: any) => ({
          ...item,
          ...(item.file ? { file: await getFileUrl(item.file) } : {}),
        })),
      );
    }
  }

  successResponse(res, 200, "Media Kit created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = (req.query.type as string) || undefined;

  const records = await mediaKitService.getAllList(page, limit, search, type);
  await Promise.all(
    records.data.map(async (data: any) => {
      data.logo = data.logo ? await getFileUrl(data.logo) : null;
      if (Array.isArray(data.listKit)) {
        data.listKit = await Promise.all(
          data.listKit.map(async (item: any) => ({
            ...item,
            file: item.file ? await getFileUrl(item.file) : null,
          })),
        );
      }
    }),
  );

  successResponse(res, 200, "Media Kit records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await mediaKitService.getMediaKitById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  if (record) {
    record.logo = record.logo ? await getFileUrl(record.logo) : null;
    if (Array.isArray(record.listKit)) {
      record.listKit = await Promise.all(
        record.listKit.map(async (item: any) => ({
          ...item,
          file: item.file ? await getFileUrl(item.file) : null,
        })),
      );
    }
  }

  successResponse(res, 200, "Get edit Media Kit record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await mediaKitService.getMediaKitById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 1. Normalize uploaded files */
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  /** 2. Parse existing files */
  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.logo && typeof oldRecord.logo === "object") {
    filesByFieldname = { ...(oldRecord.logo as any) };
  }
  /** 3. Track files to delete */
  const filesToDelete: string[] = [];

  const newLogo = allFiles.find((f) => f.fieldname === "logo");
  if (newLogo && oldRecord.logo) await deleteFromS3(oldRecord.logo as string);

  const listKit = req.body.listKit || oldRecord.listKit;

  listKit.forEach((item: any, index: number) => {
    const file = allFiles.find(
      (f: any) => f.fieldname === `listKit[${index}][file]`,
    );
    const oldImage = (oldRecord.listKit as any[] | undefined)?.[index]?.file;

    if (file && oldImage) {
      deleteFromS3(oldImage);
    }
    item.file = file ? file.key : oldImage || null;
  });

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      logo: newLogo ? newLogo.key : oldRecord.logo,
      alt: req.body.alt,
      title: req.body.title,
      type: req.body.type,
      watermark: req.body.watermark,
      link: req.body.link,
      listKit: req.body.listKit,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await mediaKitService.updateMediaKit(id, updatePayload);

  /** 6. Delete old files AFTER DB update */
  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  /** 7. Attach presigned URLs */
  if (updatedRecord) {
    updatedRecord.logo = updatedRecord.logo
      ? await getFileUrl(updatedRecord.logo)
      : null;

    if (Array.isArray(updatedRecord.listKit)) {
      updatedRecord.listKit = await Promise.all(
        updatedRecord.listKit.map(async (item: any) => ({
          ...item,
          file: item.file ? await getFileUrl(item.file) : null,
        })),
      );
    }
  }

  successResponse(res, 200, "Media Kit updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await mediaKitService.getMediaKitById(id);

  if (!item) {
    throw new ApiError(404, "Media Kit record not found");
  }

  // if (item) {
  //      item.logo && await deleteFromS3(item.logo);
  //      if (Array.isArray(item.listKit)) {
  //           await Promise.all(
  //                item.listKit.map(async (item: any) => {
  //                     if (item.image) await deleteFromS3(item.image);
  //                     return item;
  //                })
  //           );
  //      }
  // }

  await mediaKitService.deleteMediaKitById(id);
  successResponse(res, 200, "Media Kit record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const user = req.user!;
    const { id } = req.params;
    const { seq } = req.body;

    let payload: any = { updatedBy: user.id };

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    payload.seq = Number(seq);

    const record = await mediaKitService.getMediaKitById(id);
    if (!record) {
      throw new ApiError(404, "Media Kit record not found");
    }

    const updatedProject = await mediaKitService.updateProjectSeq(id, payload);
    successResponse(res, 200, "Media Kit seq successfully", updatedProject);
  },
);

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

    const record = (mediaKitService as any).getById
      ? await (mediaKitService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (mediaKitService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
