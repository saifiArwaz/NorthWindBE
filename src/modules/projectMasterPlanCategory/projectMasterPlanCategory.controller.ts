import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as categoryService from "./projectMasterPlanCategory.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const data = {
    ...req.body,
    createdBy: user?.id,
  };

  const record = await categoryService.createCategory(data);
  successResponse(res, 201, "Category created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const projectId = req.query.projectId as string;

  if (!projectId) {
    throw new ApiError(400, "Project Id required");
  }

  const records = await categoryService.getAllCategories(
    page,
    limit,
    search,
    projectId
  );
  successResponse(res, 200, "Categories fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await categoryService.getCategoryById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  successResponse(res, 200, "Category fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await categoryService.getCategoryById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const updatePayload = {
    ...req.body,
    updatedBy: user.id,
  };

  const updatedRecord = await categoryService.updateCategory(id, updatePayload);
  successResponse(res, 200, "Category updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await categoryService.getCategoryById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  await categoryService.deleteCategory(id);
  successResponse(res, 200, "Category deleted successfully");
});

export const changeSeq = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const { seq } = req.body;

  if (isNaN(seq)) {
    throw new ApiError(400, "Seq value must be a number");
  }

  const record = await categoryService.getCategoryById(id);
  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  const payload = { seq: Number(seq), updatedBy: user.id };
  const updatedProject = await categoryService.updateSeq(id, payload);
  successResponse(res, 200, "Seq Updated successfully", updatedProject);
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
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
      "status value must be a boolean (true or false), 1/0 or 'true'/'false'"
    );
  }

  if (typeof status === "string") {
    status = status === "true" || status === "1";
  } else if (typeof status === "number") {
    status = status === 1;
  }

  const updatedRecord = await categoryService.updateStatus(
    id,
    status as boolean,
    user?.id
  );
  successResponse(res, 200, "Status updated successfully", updatedRecord);
});
