import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as projectStatusService from "./projectStatus.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await projectStatusService.createProjectStatus({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 200, "Project status created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await projectStatusService.getAllList(page, limit, search);
  successResponse(
    res,
    200,
    "Project status records fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectStatusService.getProjectStatusById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  successResponse(res, 200, "Get edit project status record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const oldRecord = await projectStatusService.getProjectStatusById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const updatedRecord = await projectStatusService.updateProjectStatus(id, {
    ...req.body,
    updatedBy: user.id,
  });

  successResponse(
    res,
    200,
    "Project status updated successfully",
    updatedRecord,
  );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await projectStatusService.getProjectStatusById(id);

  if (!item) {
    throw new ApiError(404, "Project status record not found");
  }

  await projectStatusService.deleteProjectStatus(id);
  successResponse(res, 200, "Project status record deleted successfully");
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

    const record = await projectStatusService.getProjectStatusById(id);
    if (!record) {
      throw new ApiError(404, "Project status record not found");
    }

    const updatedProject = await projectStatusService.updateProjectStatusSeq(id, payload);
    successResponse(res, 200, "Project status seq updated successfully", updatedProject);
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

    const record = (projectStatusService as any).getById
      ? await (projectStatusService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (projectStatusService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
