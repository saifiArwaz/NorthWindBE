import asyncHandler from "express-async-handler";
import logger from "../../utils/logger.utils.js";
import { Request, Response } from "express";
import * as contentByTypeServices from "./contentByType.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, any> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        if (Array.isArray(filesByFieldname[file.fieldname])) {
          (filesByFieldname[file.fieldname] as string[]).push(file.key);
        } else {
          filesByFieldname[file.fieldname] = [
            filesByFieldname[file.fieldname] as string,
            file.key,
          ];
        }
      } else {
        filesByFieldname[file.fieldname] = file.key;
      }
    }
  });

  const record = await contentByTypeServices.createContentByType({
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
  successResponse(res, 200, "Content by type created successfully", record);
});

export const getContentByTypeList = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const type = (req.params.type as string) || "";

    const records = await contentByTypeServices.getAllList(
      type,
      page,
      limit,
      search,
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
            }),
          );
        }
      }),
    );

    successResponse(res, 200, "Page records fetch successfully", records);
  },
);

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await contentByTypeServices.getContentByTypeById(id);

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

  const oldRecord = await contentByTypeServices.getContentByTypeById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 1. Normalize uploaded files */
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  /** 2. Parse existing files */
  let filesByFieldname: Record<string, string | string[]> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  /** 3. Track files to delete */
  const filesToDelete: string[] = [];

  /** 4. Merge new uploads */
  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      const existing = filesByFieldname[file.fieldname];

      // collect old file for deletion
      if (existing) {
        if (Array.isArray(existing)) {
          filesToDelete.push(...existing);
        } else {
          filesToDelete.push(existing);
        }
      }

      // replace old value
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  /** 5. Remove entire field (removeFiles[]) */
  if (Array.isArray(req.body.removeFiles)) {
    for (const field of req.body.removeFiles) {
      const existing = filesByFieldname[field];

      if (existing) {
        if (Array.isArray(existing)) {
          filesToDelete.push(...existing);
        } else {
          filesToDelete.push(existing);
        }
        delete filesByFieldname[field];
      }
    }
  }

  /** 6. Remove specific file keys (removeFileKeys[]) */
  if (Array.isArray(req.body.removeFileKeys)) {
    for (const keyToRemove of req.body.removeFileKeys) {
      for (const field in filesByFieldname) {
        const value = filesByFieldname[field];

        if (Array.isArray(value)) {
          const filtered = value.filter((k) => k !== keyToRemove);

          if (filtered.length !== value.length) {
            filesToDelete.push(keyToRemove);
          }

          if (filtered.length > 0) {
            filesByFieldname[field] = filtered;
          } else {
            delete filesByFieldname[field];
          }
        } else if (value === keyToRemove) {
          delete filesByFieldname[field];
          filesToDelete.push(keyToRemove);
        }
      }
    }
  }

  /** 7. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      title: req.body.title,
      description: req.body.description,
      alt: req.body.alt,
      status: req.body.status,
      files: filesByFieldname,
      updatedBy: user?.id,
    }).filter(([_, v]) => v !== undefined),
  );

  /** 8. Update DB */
  const updatedRecord = await contentByTypeServices.updateContentByType(
    id,
    updatePayload,
  );

  /** 9. Delete old files from S3 */
  for (const file of filesToDelete) {
    try {
      await deleteFromS3(file);
    } catch (err) {
      logger.error("S3 delete failed:", file, err);
    }
  }

  /** 10. Convert file keys → URLs */
  if (updatedRecord?.files && typeof updatedRecord.files === "object") {
    const filesObj = updatedRecord.files as any;

    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        const value = filesObj[key];

        if (Array.isArray(value)) {
          filesObj[key] = await Promise.all(
            value.map((v: string) => getFileUrl(v)),
          );
        } else if (value) {
          filesObj[key] = await getFileUrl(value);
        }
      }),
    );
  }

  /** 11. Response */
  successResponse(res, 200, "Page updated successfully", updatedRecord);
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

    const record = await contentByTypeServices.getContentByTypeById(id);
    if (!record) {
      throw new ApiError(404, "Content by type record not found");
    }

    const updatedProject = await contentByTypeServices.updateContentSeq(
      id,
      payload,
    );
    successResponse(
      res,
      200,
      "Content by type seq successfully",
      updatedProject,
    );
  },
);

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await contentByTypeServices.getContentByTypeById(id);

  if (!record) {
    throw new ApiError(404, "record not found");
  }

  // const fileFields = [

  // ].filter(Boolean);

  // for (const file of fileFields) {
  //      file && await deleteFromS3(file);
  // }

  await contentByTypeServices.deleteContentByTypeById(id);
  successResponse(res, 200, "Content By Type record deleted successfully");
});

export const destroySinglefile = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const keyToDelete = req.body.key as string;

    if (!keyToDelete) {
      throw new ApiError(400, "File key to delete is required");
    }

    const ContentByType = await contentByTypeServices.getContentByTypeById(id);
    if (!ContentByType) {
      throw new ApiError(404, "Page section not found");
    }

    let filesObj: Record<string, any> = {};

    if (ContentByType.files && typeof ContentByType.files === "object") {
      filesObj = { ...(ContentByType.files as any) };
    } else {
      throw new ApiError(400, "Files object is not present or invalid");
    }

    const fileKeyValue = filesObj[keyToDelete];
    if (!fileKeyValue) {
      throw new ApiError(404, "File key not found in files object");
    }

    await deleteFromS3(fileKeyValue);
    delete filesObj[keyToDelete];

    const updatedRecord = await contentByTypeServices.updateContentByType(id, {
      files: filesObj,
    });

    successResponse(
      res,
      200,
      "File deleted and files object updated successfully",
    );
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

    const record = (contentByTypeServices as any).getById
      ? await (contentByTypeServices as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (contentByTypeServices as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
