import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as blogCategoriesService from "./blog-categories.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const createBlogCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as { id?: string };
    const record = await blogCategoriesService.createBlogCategories({
      ...req.body,
      createdBy: user?.id,
    });

    successResponse(res, 200, "BlogCategories created successfully", record);
  },
);

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await blogCategoriesService.getAllList(page, limit, search);

  successResponse(
    res,
    200,
    "BlogCategories records fetch successfully",
    records,
  );
});

export const getBlogCategoriesById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const record = await blogCategoriesService.getBlogCategoriesById(id);

    if (!record) {
      throw new ApiError(404, "Reocrd not found");
    }
    successResponse(res, 200, "Get edit BlogCategories record", record);
  },
);

export const updateBlogCategoriesById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as { id?: string };
    const id = req.params.id as string;

    const updatePayload: any = {
      ...req.body,
      updatedBy: user.id,
    };

    const updatedRecord = await blogCategoriesService.updateBlogCategories(
      id,
      updatePayload,
    );

    successResponse(
      res,
      200,
      "BlogCategories updated successfully",
      updatedRecord,
    );
  },
);

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await blogCategoriesService.getBlogCategoriesById(id);

  if (!item) {
    throw new ApiError(404, "BlogCategories record not found");
  }
  await blogCategoriesService.deleteBlogCategoriesById(id);
  successResponse(res, 200, "BlogCategories record deleted successfully");
});

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

    const record = (blogCategoriesService as any).getById
      ? await (blogCategoriesService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (blogCategoriesService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
