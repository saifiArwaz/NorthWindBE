import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as valuesService from "./values.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl, deleteFromS3 } from "../../utils/fileHandling.utils.js";
import type { IValuesUpdateDTO } from "./values.interface.js";

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

  const record = await valuesService.createValues({
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

  successResponse(res, 200, "Values created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await valuesService.getAllList(page, limit, search);

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

  successResponse(res, 200, "Values records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await valuesService.getValuesById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
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

  successResponse(res, 200, "Get Values record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await valuesService.getValuesById(id);

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

  if (Array.isArray((req.body as any).removeFiles)) {
    for (const field of (req.body as any).removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  const updatePayload: IValuesUpdateDTO = {
    key: (req.body as any).key,
    title: (req.body as any).title,
    files: filesByFieldname,
    status:
      (req.body as any).status !== undefined
        ? (req.body as any).status === "true" ||
          (req.body as any).status === true
        : undefined,
    updatedBy: user.id,
  };

  const updatedRecord = await valuesService.updateValues(id, updatePayload);

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

  successResponse(res, 200, "Values updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await valuesService.getValuesById(id);

  if (!item) {
    throw new ApiError(404, "Values record not found");
  }

  // const fileFields: string[] = [];
  // if (item.files && typeof item.files === "object") {
  //      const filesObj = item.files as any;
  //      for (const key of Object.keys(filesObj)) {
  //           if (filesObj[key]) {
  //                fileFields.push(filesObj[key]);
  //           }
  //      }
  // }

  // for (const file of fileFields) {
  //      file && (await deleteFromS3(file));
  // }

  await valuesService.deleteValues(id);
  successResponse(res, 200, "Values record deleted successfully");
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

    const record = (valuesService as any).getById
      ? await (valuesService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (valuesService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
