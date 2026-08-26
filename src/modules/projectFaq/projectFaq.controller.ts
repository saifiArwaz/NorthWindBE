import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectFaqService from "./projectFaq.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import * as projectService from "../projects/project.service.js";

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

  const data: any = {
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  };

  const record = await projectFaqService.createProjectFaq(data);

  successResponse(res, 200, "Project Floor plan created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const { projectId } = req.query;

  const record = await projectService.getProjectById(projectId as string);
  if (!record) {
    throw new ApiError(404, "Invalid Project Id / Project not found");
  }

  const records = await projectFaqService.getAllList(
    page,
    limit,
    search,
    projectId as string,
  );

  successResponse(
    res,
    200,
    "Project Floor plan records fetch successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectFaqService.getProjectFaqById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  successResponse(res, 200, "Get edit project Floor plan record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await projectFaqService.getProjectFaqById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      question: req.body.question,
      answer: req.body.answer,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await projectFaqService.updateProjectFaq(
    id,
    updatePayload,
  );

  successResponse(
    res,
    200,
    "Project Floor plan updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await projectFaqService.getProjectFaqById(id);

  if (!item) {
    throw new ApiError(404, "Project Floor plan record not found");
  }

  await projectFaqService.deleteProjectFaq(id);
  successResponse(res, 200, "Project Floor plan record deleted successfully");
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

    const record = await projectFaqService.getProjectFaqById(id);
    if (!record) {
      throw new ApiError(404, "Floorplan record not found");
    }

    const updatedProject = await projectFaqService.updateSeq(id, payload);
    successResponse(res, 200, "Seq Updated successfully", updatedProject);
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

    const record = (projectFaqService as any).getById
      ? await (projectFaqService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (projectFaqService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
