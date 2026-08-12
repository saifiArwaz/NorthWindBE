import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as menuService from "./menu.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import type { S3UploadedFile } from "../../middlewares/multer-s3.middleware.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await menuService.createTeamSection({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 200, "Team created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await menuService.getMenuTree(page, limit);
  successResponse(res, 200, "Team records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await menuService.getTeamSectionById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }
  successResponse(res, 200, "Get edit page record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await menuService.getTeamSectionById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      name: req.body.name,
      designation: req.body.designation,
      description: req.body.description,
      alt: req.body.alt,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await menuService.updateTeamSection(id, updatePayload);

  successResponse(res, 200, "Team updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await menuService.getTeamSectionById(id);

  if (!item) {
    throw new ApiError(404, "Team record not found");
  }

  await menuService.deleteTeamSectionById(id);
  successResponse(res, 200, "Team record deleted successfully");
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

    const record = await menuService.getTeamSectionById(id);
    if (!record) {
      throw new ApiError(404, "Project record not found");
    }

    const updatedProject = await menuService.updateProjectSeq(id, payload);
    successResponse(res, 200, "Project seq successfully", updatedProject);
  },
);
