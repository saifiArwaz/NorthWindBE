import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as HomeLoanAssistanceService from "./homeLoanAssistance.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl, deleteFromS3 } from "../../utils/fileHandling.utils.js";
import type { IHomeLoanAssistanceUpdateDTO } from "./homeLoanAssistance.interface.js";

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

  const record = await HomeLoanAssistanceService.createHomeLoanAssistance({
    ...req.body,
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

  successResponse(res, 200, "Home Loan Assistance created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await HomeLoanAssistanceService.getAllList(page, limit, search);

  if (records && records.data) {
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
  }

  successResponse(res, 200, "Home Loan Assistance records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await HomeLoanAssistanceService.getHomeLoanAssistanceById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

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

  successResponse(res, 200, "Home Loan Assistance record fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await HomeLoanAssistanceService.getHomeLoanAssistanceById(id);
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

  const updatePayload: IHomeLoanAssistanceUpdateDTO = Object.fromEntries(
    Object.entries({
      title: req.body.title,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      status: req.body.status,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await HomeLoanAssistanceService.updateHomeLoanAssistance(
    id,
    updatePayload,
  );

  for (const file of filesToDelete) {
    if (file) await deleteFromS3(file);
  }

  if (updatedRecord.files && typeof updatedRecord.files === "object") {
    const filesObj = updatedRecord.files as any;
    for (const key of Object.keys(filesObj)) {
      if (filesObj[key]) {
        filesObj[key] = await getFileUrl(filesObj[key]);
      }
    }
  }

  successResponse(res, 200, "Home Loan Assistance updated successfully", updatedRecord);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await HomeLoanAssistanceService.getHomeLoanAssistanceById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  const fileFields: string[] = [];
  if (item.files && typeof item.files === "object") {
    const filesObj = item.files as any;
    for (const key of Object.keys(filesObj)) {
      if (filesObj[key]) {
        fileFields.push(filesObj[key]);
      }
    }
  }
  for (const file of fileFields) {
    if (file) await deleteFromS3(file);
  }

  await HomeLoanAssistanceService.deleteHomeLoanAssistanceById(id);
  successResponse(res, 200, "Home Loan Assistance record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const payload = {
      seq: Number(seq),
      updatedBy: user?.id,
    };

    const record = await HomeLoanAssistanceService.getHomeLoanAssistanceById(id);
    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    const updatedRecord = await HomeLoanAssistanceService.updateHomeLoanAssistanceSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Sequence updated successfully", updatedRecord);
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

    const updatedRecord = await HomeLoanAssistanceService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
