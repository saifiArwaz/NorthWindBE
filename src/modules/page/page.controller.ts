import asyncHandler from "express-async-handler";
import logger from "../../utils/logger.utils.js";
import { Request, Response } from "express";
import * as pageService from "./page.service.js";
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

  const seoTags = req.body.seoTags || {};
  const title =
    typeof req.body.title === "string"
      ? JSON.parse(req.body.title)
      : req.body.title;
  const description =
    typeof req.body.description === "string"
      ? JSON.parse(req.body.description)
      : req.body.description;

  const page = await pageService.createPage({
    ...req.body,
    title,
    description,
    seoTags,
    files: filesByFieldname,
    createdBy: user?.id,
  });

  if (page) {
    if (page.files && typeof page.files === "object") {
      const filesObj = page.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        }),
      );
    }
  }

  successResponse(res, 200, "Page created successfully", page);
});

export const getDistictPageList = asyncHandler(
  async (req: Request, res: Response) => {
    const records = await pageService.getDistinctPageList();
    logger.info(records);
    successResponse(res, 200, "Page records fetch successfully", records);
  },
);

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await pageService.getAllList(page, limit, search);
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

  successResponse(res, 200, "Page records fetch successfully", records);
});

export const getParentPages = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await pageService.getAllParentPageList(page, limit, search);
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

    successResponse(res, 200, "Page records fetch successfully", records);
  },
);

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await pageService.getPageById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  if (record) {
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
  }

  successResponse(res, 200, "Get edit page record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await pageService.getPageById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 1. Normalize uploaded files */
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  /** 2. Parse existing files */
  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  /** 3. Track files to delete */
  const filesToDelete: string[] = [];

  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        filesToDelete.push(filesByFieldname[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  /** 4. Optional explicit file removal (frontend sends removeFiles[]) */
  if (Array.isArray(req.body.removeFiles)) {
    for (const field of req.body.removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      pageName: req.body.pageName,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      link: req.body.link,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      seoTags: req.body.seoTags,
      status: req.body.status,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await pageService.updatePage(id, updatePayload);

  /** 6. Delete old files AFTER DB update */
  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  /** 7. Attach presigned URLs */
  if (updatedRecord.files) {
    for (const key of Object.keys(updatedRecord.files as any)) {
      const value = (updatedRecord.files as any)[key];
      if (value) {
        (updatedRecord.files as any)[key] = await getFileUrl(value);
      }
    }
  }

  successResponse(res, 200, "Page updated successfully", updatedRecord);
});

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const page = await pageService.getPageById(id);

  if (!page) {
    throw new ApiError(404, "Page not found");
  }
  await pageService.deletePageById(id);
  successResponse(res, 200, "Page deleted successfully");
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

    const record = await pageService.getPageById(id);
    if (!record) {
      throw new ApiError(404, "Page record not found");
    }

    const updatedProject = await pageService.updatePageSeq(id, payload);
    successResponse(res, 200, "Page seq successfully", updatedProject);
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

    const record = (pageService as any).getById
      ? await (pageService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (pageService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
