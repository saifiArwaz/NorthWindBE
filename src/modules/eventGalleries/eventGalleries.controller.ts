import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as eventsGalleryService from "./eventGalleries.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";

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
      ? req.body.categoryId
      : undefined;

  const record = await eventsGalleryService.createEventsGallery({
    ...req.body,
    categoryId: normalizedCategoryId,
    files: filesByFieldname,
    createdBy: user?.id,
  });

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

  successResponse(res, 200, "Event Gallery created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const categoryId = (req.query.categoryId as string) || undefined;
  const eventId = (req.query.eventId as string) || undefined;

  const records = await eventsGalleryService.getAllList(page, limit, search, categoryId, eventId);
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

  successResponse(
    res,
    200,
    "Event Gallery records fetch successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await eventsGalleryService.getEventsGalleryById(id);

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

  const oldRecord = await eventsGalleryService.getEventsGalleryById(id);

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

  const normalizedCategoryId =
    req.body.categoryId === ""
      ? null
      : req.body.categoryId !== undefined
      ? req.body.categoryId
      : undefined;

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      fileType: req.body.fileType,
      title:req.body.title,
      categoryId: normalizedCategoryId,
      eventId: req.body.eventId,
      files: filesByFieldname,
      link: req.body.link,
      alt: req.body.alt,
      watermark: req.body.watermark,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await eventsGalleryService.updateEventsGallery(
    id,
    updatePayload,
  );

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

  successResponse(
    res,
    200,
    "Event Gallery updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await eventsGalleryService.getEventsGalleryById(id);

  if (!item) {
    throw new ApiError(404, "Event Gallery record not found");
  }

  const fileFields = [];
  if (item.files && typeof item.files === 'object') {
       const filesObj = item.files as any;
       for (const key of Object.keys(filesObj)) {
            if (filesObj[key]) {
                 fileFields.push(filesObj[key]);
            }
       }
  }
  for (const file of fileFields) {
       file && await deleteFromS3(file);
  }

  await eventsGalleryService.deleteEventsGalleryById(id);
  successResponse(res, 200, "Event Gallery record deleted successfully");
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

    const record = await eventsGalleryService.getEventsGalleryById(id);
    if (!record) {
      throw new ApiError(404, "Project record not found");
    }

    const updatedProject = await eventsGalleryService.updateEventGallerySeq(
      id,
      payload,
    );
    successResponse(res, 200, "Project seq successfully", updatedProject);
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

    const record = (eventsGalleryService as any).getById
      ? await (eventsGalleryService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (eventsGalleryService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);

export const changeFeature = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { isFeature } = req.body;

    if (
      !(
        typeof isFeature === "boolean" ||
        isFeature === "true" ||
        isFeature === "false" ||
        isFeature === 1 ||
        isFeature === 0 ||
        isFeature === "1" ||
        isFeature === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isFeature value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isFeature === "string") {
      if (isFeature === "true") isFeature = true;
      else if (isFeature === "false") isFeature = false;
      else if (isFeature === "1") isFeature = true;
      else if (isFeature === "0") isFeature = false;
    } else if (typeof isFeature === "number") {
      isFeature = isFeature === 1;
    }

    const record = await eventsGalleryService.getEventsGalleryById(id);
    if (!record) {
      throw new ApiError(404, "Event Gallery record not found");
    }

    const updatedRecord = await eventsGalleryService.updateFeature(
      id,
      isFeature as boolean,
      user?.id,
    );

    successResponse(res, 200, "isFeature updated successfully", updatedRecord);
  },
);
