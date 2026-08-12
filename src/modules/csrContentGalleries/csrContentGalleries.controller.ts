import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as csrContentGalleriesService from "./csrContentGalleries.service.js";
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

  const record = await csrContentGalleriesService.createCsrGalleries({
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

  successResponse(res, 200, "CSR Gallery created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = (req.query.type as string);

  const records = await csrContentGalleriesService.getAllcsrContentGalleries(
    page,
    limit,
    search,
    type,
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

  successResponse(res, 200, "CSR Gallery records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record =
    await csrContentGalleriesService.getcsrContentGalleriesById(id);

  if (!record) {
    throw new ApiError(404, "CSR Gallery record not found");
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

  successResponse(res, 200, "Get edit CSR Gallery record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord =
    await csrContentGalleriesService.getcsrContentGalleriesById(id);

  if (!oldRecord) {
    throw new ApiError(404, "CSR Gallery record not found");
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
      type: req.body.type,
      fileType: req.body.fileType,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      link: req.body.link,
      status: req.body.status,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord =
    await csrContentGalleriesService.updatecsrContentGalleries(
      id,
      updatePayload,
    );

  /** 6. Delete old files AFTER DB update */
  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  /** 7. Attach presigned URLs */
  if (updatedRecord.files && typeof updatedRecord.files === "object") {
    const filesObj = updatedRecord.files as any;
    for (const key of Object.keys(filesObj)) {
      const value = filesObj[key];
      if (value) {
        filesObj[key] = await getFileUrl(value);
      }
    }
  }

  successResponse(res, 200, "CSR Gallery updated successfully", updatedRecord);
});

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await csrContentGalleriesService.getcsrContentGalleriesById(id);

  if (!item) {
    throw new ApiError(404, "CSR Gallery record not found");
  }

  const fileFields = [];
  if (item.files && typeof item.files === "object") {
    const filesObj = item.files as any;
    for (const key of Object.keys(filesObj)) {
      if (filesObj[key]) {
        fileFields.push(filesObj[key]);
      }
    }
  }
  for (const file of fileFields) {
    file && (await deleteFromS3(file));
  }

  await csrContentGalleriesService.deletecsrContentGalleriesById(id);
  successResponse(res, 200, "CSR Gallery record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(Number(seq))) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const record =
      await csrContentGalleriesService.getcsrContentGalleriesById(id);
    if (!record) {
      throw new ApiError(404, "CSR Gallery record not found");
    }

    const updatedRecord = await csrContentGalleriesService.updateSeq(id, {
      seq: Number(seq),
      updatedBy: user.id,
    });
    successResponse(res, 200, "CSR Gallery seq updated successfully", updatedRecord);
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

    const record =
      await csrContentGalleriesService.getcsrContentGalleriesById(id);
    if (!record) {
      throw new ApiError(404, "CSR Gallery record not found");
    }

    const updatedRecord = await csrContentGalleriesService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
