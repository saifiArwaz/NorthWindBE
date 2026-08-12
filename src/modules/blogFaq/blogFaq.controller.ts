import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as blogFaqService from "./blogFaq.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import * as blogService from "../blogs/blogs.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const data: any = {
    ...req.body,
    createdBy: user?.id,
  };

  const record = await blogFaqService.createBlogFaq(data);

  successResponse(res, 200, "Blog FAQ created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const { blogId } = req.query;

  if (!blogId || typeof blogId !== "string") {
    throw new ApiError(400, "blogId query parameter is required");
  }

  const record = await blogService.getBlogById(blogId as string);
  if (!record) {
    throw new ApiError(404, "Invalid Blog Id / Blog not found");
  }

  const records = await blogFaqService.getAllList(
    page,
    limit,
    search,
    blogId as string,
  );

  successResponse(
    res,
    200,
    "Blog FAQ records fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await blogFaqService.getBlogFaqById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  successResponse(res, 200, "Get edit Blog FAQ record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await blogFaqService.getBlogFaqById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      question: req.body.question,
      answer: req.body.answer,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await blogFaqService.updateBlogFaq(
    id,
    updatePayload,
  );

  successResponse(
    res,
    200,
    "Blog FAQ updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await blogFaqService.getBlogFaqById(id);

  if (!item) {
    throw new ApiError(404, "Blog FAQ record not found");
  }

  await blogFaqService.deleteBlogFaq(id);
  successResponse(res, 200, "Blog FAQ record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, any>,
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

    const record = await blogFaqService.getBlogFaqById(id);
    if (!record) {
      throw new ApiError(404, "Blog FAQ record not found");
    }

    const updated = await blogFaqService.updateSeq(id, payload);
    successResponse(res, 200, "Seq updated successfully", updated);
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

    const record = await blogFaqService.getBlogFaqById(id);
    if (!record) {
      throw new ApiError(404, "Blog FAQ record not found");
    }

    const updatedRecord = await blogFaqService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
