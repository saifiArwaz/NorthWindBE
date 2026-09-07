import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as galleryService from "./projectMasterPlanPinGallery.service.js";
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

  const data = {
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  };

  const record = await galleryService.createGallery(data);

  if (record) {
    if (record.files && typeof record.files === "object") {
      const filesObj = record.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        })
      );
    }
  }

  successResponse(res, 201, "Gallery created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const pinId = req.query.pinId as string;

  if (!pinId) {
    throw new ApiError(400, "Pin Id required");
  }

  const records = await galleryService.getAllGalleries(
    page,
    limit,
    search,
    pinId
  );

  await Promise.all(
    records.data.map(async (data: any) => {
      if (data.files && typeof data.files === "object") {
        const filesObj = data.files as any;
        await Promise.all(
          Object.keys(filesObj).map(async (key) => {
            if (filesObj[key]) {
              filesObj[key] = await getFileUrl(filesObj[key]);
            }
          })
        );
      }
    })
  );

  successResponse(res, 200, "Galleries fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await galleryService.getGalleryById(id);

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
        })
      );
    }
  }

  successResponse(res, 200, "Gallery fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await galleryService.getGalleryById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
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

  const updatePayload = {
    ...req.body,
    files: filesByFieldname,
    updatedBy: user.id,
  };

  const updatedRecord = await galleryService.updateGallery(id, updatePayload);

  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  if (updatedRecord.files) {
    for (const key of Object.keys(updatedRecord.files as any)) {
      const value = (updatedRecord.files as any)[key];
      if (value) {
        (updatedRecord.files as any)[key] = await getFileUrl(value);
      }
    }
  }

  successResponse(res, 200, "Gallery updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await galleryService.getGalleryById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  await galleryService.deleteGallery(id);
  successResponse(res, 200, "Gallery deleted successfully");
});

export const changeSeq = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const { seq } = req.body;

  if (isNaN(seq)) {
    throw new ApiError(400, "Seq value must be a number");
  }

  const record = await galleryService.getGalleryById(id);
  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  const payload = { seq: Number(seq), updatedBy: user.id };
  const updatedProject = await galleryService.updateSeq(id, payload);
  successResponse(res, 200, "Seq Updated successfully", updatedProject);
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
      "status value must be a boolean (true or false), 1/0 or 'true'/'false'"
    );
  }

  if (typeof status === "string") {
    status = status === "true" || status === "1";
  } else if (typeof status === "number") {
    status = status === 1;
  }

  const updatedRecord = await galleryService.updateStatus(
    id,
    status as boolean,
    user?.id
  );
  successResponse(res, 200, "Status updated successfully", updatedRecord);
});
