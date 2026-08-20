import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as projectContentDetailsService from "./projectContentDetails.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getProjectById } from "../projects/project.service.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";
import { serializeBigInt } from "../../utils/serialize.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const project = await getProjectById(req.body.projectId);
  if (!project) {
    throw new ApiError(404, "Invalid Project Id / Project not found");
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
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

  const record = await projectContentDetailsService.createProjectContentDetails(data);
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
  successResponse(res, 201, "Project Content Details created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const projectId = req.query.projectId as string;

  if (projectId) {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new ApiError(404, "Invalid Project Id / Project not found");
    }
  }

  const records = await projectContentDetailsService.getAllList(
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
    "Project Content Details fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectContentDetailsService.getProjectContentDetailsById(id);

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
  successResponse(res, 200, "Get Project Content Details record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await projectContentDetailsService.getProjectContentDetailsById(id);

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

  const data: any = {
    ...req.body,
    files: filesByFieldname,
    updatedBy: user?.id,
  };

  const record = await projectContentDetailsService.updateProjectContentDetails(id, data);

  if (record) {
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map((key) => deleteFromS3(key)));
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
  }

  successResponse(res, 200, "Project Content Details updated successfully", record);
});

export const changeStatus = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
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

    const project = await projectContentDetailsService.getProjectContentDetailsById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectContentDetailsService.updateStatus(
      id,
      status,
      user.id,
    );

    successResponse(
      res,
      200,
      "Status column updated successfully",
      serializeBigInt(updatedproject),
    );
  },
);


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

    const record = await projectContentDetailsService.getProjectContentDetailsById(id);
    if (!record) {
      throw new ApiError(404, "Project record not found");
    }

    const updatedProject = await projectContentDetailsService.updateSeq(id, payload);
    successResponse(
      res,
      200,
      "Project Content Details  seq successfully",
      serializeBigInt(updatedProject),
    );
  },
);


export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const oldRecord = await projectContentDetailsService.getProjectContentDetailsById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  await projectContentDetailsService.deleteProjectContentDetailsById(id);

  successResponse(res, 200, "Record deleted successfully");
});
