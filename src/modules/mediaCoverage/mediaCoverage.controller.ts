import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as mediaCoverageService from "./mediaCoverage.service.js";
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

  const record = await mediaCoverageService.createMediaCoverage({
    ...req.body,
    dateAt: req.body.dateAt ? new Date(req.body.dateAt) : null,
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

  successResponse(res, 200, "Media Coverage created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const mediaType = (req.query.mediaType as string) || undefined;

  const records = await mediaCoverageService.getAllList(page, limit, search, mediaType);
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
    "Media Coverage records fetch successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await mediaCoverageService.getMediaCoverageById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }
  successResponse(res, 200, "Get edit Media Coverage record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await mediaCoverageService.getMediaCoverageById(id);

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

  const updatePayload = Object.fromEntries(
    Object.entries({
      title: req.body.title,
      mediaType: req.body.mediaType,
      dateAt: req.body.dateAt ? new Date(req.body.dateAt) : undefined,
      alt: req.body.alt,
      watermark: req.body.watermark,
      link: req.body.link,
      description: req.body.description,
      files: filesByFieldname,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await mediaCoverageService.updateMediaCoverage(
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

  successResponse(
    res,
    200,
    "Media Coverage updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await mediaCoverageService.getMediaCoverageById(id);

  if (!item) {
    throw new ApiError(404, "Media Coverage record not found");
  }

  // const fileFields = [];
  // if (item.files && typeof item.files === 'object') {
  //      const filesObj = item.files as any;
  //      for (const key of Object.keys(filesObj)) {
  //           if (filesObj[key]) {
  //                fileFields.push(filesObj[key]);
  //           }
  //      }
  // }
  // for (const file of fileFields) {
  //      file && await deleteFromS3(file);
  // }

  await mediaCoverageService.deleteMediaCoverageById(id);
  successResponse(res, 200, "Media Coverage record deleted successfully");
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

    const record = await mediaCoverageService.getMediaCoverageById(id);
    if (!record) {
      throw new ApiError(404, "Media Coverage record not found");
    }

    const updatedProject = await mediaCoverageService.updateProjectSeq(
      id,
      payload,
    );
    successResponse(
      res,
      200,
      "Media Coverage seq successfully",
      updatedProject,
    );
  },
);

export const chooseFeature = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    let { isHome } = req.body;

    if (
      !(
        typeof isHome === "boolean" ||
        isHome === "true" ||
        isHome === "false" ||
        isHome === 1 ||
        isHome === 0 ||
        isHome === "1" ||
        isHome === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isHome value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isHome === "string") {
      if (isHome === "true") isHome = true;
      else if (isHome === "false") isHome = false;
      else if (isHome === "1") isHome = true;
      else if (isHome === "0") isHome = false;
    } else if (typeof isHome === "number") {
      isHome = isHome === 1;
    }

    const project = await mediaCoverageService.getMediaCoverageById(id);
    if (!project) {
      throw new ApiError(404, "Media Coverage not found");
    }

    const updatedproject = await mediaCoverageService.updateFeature(
      id,
      isHome,
      user?.id,
    );

    successResponse(
      res,
      200,
      "Feature column updated successfully",
      updatedproject,
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

    const record = (mediaCoverageService as any).getById
      ? await (mediaCoverageService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (mediaCoverageService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
