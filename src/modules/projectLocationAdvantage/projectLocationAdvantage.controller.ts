import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectLocationAdvService from "./projectLocationAdvantage.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import * as projectService from "../projects/project.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const data: any = {
    ...req.body,
    createdBy: user?.id,
  };
  const record = await projectLocationAdvService.createProjectLocationAdv(data);
  successResponse(res, 200, "Project Location created successfully", record);
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

  const records = await projectLocationAdvService.getAllList(
    page,
    limit,
    search,
    projectId as string,
  );

  successResponse(
    res,
    200,
    "Project Location records fetch successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectLocationAdvService.getProjectLocationAdvById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  successResponse(res, 200, "Get edit project Location record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord =
    await projectLocationAdvService.getProjectLocationAdvById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      name: req.body.name,
      duration: req.body.duration,
      durationUnit: req.body.durationUnit,
      updatedBy: user?.id,
    }).filter(([_, v]) => v !== undefined),
  );
  const updatedRecord =
    await projectLocationAdvService.updateProjectLocationAdv(id, updatePayload);

  successResponse(
    res,
    200,
    "Project Location updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await projectLocationAdvService.getProjectLocationAdvById(id);

  if (!item) {
    throw new ApiError(404, "Project Location record not found");
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
  await projectLocationAdvService.deleteProjectLocationAdv(id);
  successResponse(res, 200, "Project Location record deleted successfully");
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

    const record =
      await projectLocationAdvService.getProjectLocationAdvById(id);
    if (!record) {
      throw new ApiError(404, "Location record not found");
    }

    const updatedProject = await projectLocationAdvService.updateSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Seq updated successfully", updatedProject);
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

    const record = (projectLocationAdvService as any).getById
      ? await (projectLocationAdvService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (projectLocationAdvService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
