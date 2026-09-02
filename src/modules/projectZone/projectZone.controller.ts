import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as projectZoneService from "./projectZone.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getProjectById } from "../projects/project.service.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const project = await getProjectById(req.body.projectId);
  if (!project) {
    throw new ApiError(404, "Invalid Project Id / Project not found");
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  const filesByFieldname: Record<string, string> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const data: any = {
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  };

  const record = await projectZoneService.createProjectZone(data);
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
  successResponse(res, 200, "Project Zone created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const projectId = req.query.projectId as string | undefined;

  if (projectId) {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new ApiError(404, "Invalid Project Id / Project not found");
    }
  }

  const records = await projectZoneService.getAllList(
    projectId,
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

  successResponse(
    res,
    200,
    "Project Zone records fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectZoneService.getProjectZoneById(id);

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

  successResponse(res, 200, "Get Project Zone record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await projectZoneService.getProjectZoneById(id);

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
      name: req.body.name,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await projectZoneService.updateProjectZone(
    id,
    updatePayload,
  );

  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  if (updatedRecord && updatedRecord.files && typeof updatedRecord.files === "object") {
    const filesObj = updatedRecord.files as any;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      }),
    );
  }

  successResponse(
    res,
    200,
    "Project Zone updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await projectZoneService.getProjectZoneById(id);

  if (!item) {
    throw new ApiError(404, "Project Zone record not found");
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
    file && (await deleteFromS3(file));
  }

  await projectZoneService.deleteProjectZone(id);
  successResponse(res, 200, "Project Zone record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const user = req.user!;
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(Number(seq))) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const record = await projectZoneService.getProjectZoneById(id);
    if (!record) {
      throw new ApiError(404, "Project Zone record not found");
    }

    const updatedProject = await projectZoneService.updateProjectSeq(id, {
      seq: Number(seq),
      updatedBy: user.id,
    });

    successResponse(
      res,
      200,
      "Project Zone seq updated successfully",
      updatedProject,
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

    const record = await projectZoneService.getProjectZoneById(id);
    if (!record) {
      throw new ApiError(404, "Project Zone record not found");
    }

    const updatedRecord = await projectZoneService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
