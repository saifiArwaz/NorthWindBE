import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as eventCategoryService from "./eventCategory.service.js";
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

  const record = await eventCategoryService.createEventCategory({
    ...req.body,
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

  successResponse(res, 201, "Event Category created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const eventId = (req.query.eventId as string) || undefined;

  const records = await eventCategoryService.getAllList(page, limit, search, eventId);

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
    "Event Categories fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await eventCategoryService.getEventCategoryById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
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

  successResponse(res, 200, "Event Category fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await eventCategoryService.getEventCategoryById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {
    ...(typeof oldRecord.files === "object" && oldRecord.files !== null
      ? (oldRecord.files as Record<string, string>)
      : {}),
  };
  
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      if (
        oldRecord.files &&
        (oldRecord.files as Record<string, string>)[file.fieldname]
      ) {
        deleteFromS3((oldRecord.files as Record<string, string>)[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const updatedRecord = await eventCategoryService.updateEventCategory(id, {
    ...req.body,
    files: filesByFieldname,
    updatedBy: user?.id,
  });

  if (updatedRecord) {
    if (updatedRecord.files && typeof updatedRecord.files === "object") {
      const filesObj = updatedRecord.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        }),
      );
    }
  }

  successResponse(
    res,
    200,
    "Event Category updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await eventCategoryService.getEventCategoryById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  await eventCategoryService.deleteEventCategory(id);
  successResponse(res, 200, "Event Category deleted successfully");
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

    const record = await eventCategoryService.getEventCategoryById(id);
    if (!record) {
        throw new ApiError(404, "Event Category record not found");
    }

    const updated = await eventCategoryService.updateStatus(id, status as boolean, user?.id);
    successResponse(res, 200, "Event Category status updated successfully", updated);
  },
);


export const changeSeq = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const payload = { seq: parseInt(req.body.seq), updatedBy: user.id };

  const updatedRecord = await eventCategoryService.updateSeq(id, payload);
  successResponse(res, 200, "Sequence updated successfully", updatedRecord);
});
