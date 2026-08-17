import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as eventCategoryService from "./eventCategory.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await eventCategoryService.createEventCategory({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 201, "Event Category created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await eventCategoryService.getAllList(page, limit, search);

  successResponse(
    res,
    200,
    "Event Categories fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await eventCategoryService.getEventCategoryById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }
  successResponse(res, 200, "Event Category fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await eventCategoryService.getEventCategoryById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const updatedRecord = await eventCategoryService.updateEventCategory(id, {
    ...req.body,
    updatedBy: user?.id,
  });

  successResponse(
    res,
    200,
    "Event Category updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await eventCategoryService.getEventCategoryById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  await eventCategoryService.deleteEventCategory(id);
  successResponse(res, 200, "Event Category deleted successfully");
});

export const changeStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as { id?: string };
    const id = req.params.id as string;
    const { status } = req.body;

    await eventCategoryService.updateStatus(id, status, user.id);
    successResponse(res, 200, "Status updated successfully");
  },
);

export const changeSeq = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const payload = { seq: parseInt(req.body.seq), updatedBy: user.id };

  const updatedRecord = await eventCategoryService.updateSeq(id, payload);
  successResponse(res, 200, "Sequence updated successfully", updatedRecord);
});
