import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as csrCategoryService from "./csrCategory.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await csrCategoryService.createCategory({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 201, "CSR Category created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await csrCategoryService.getAllCategories(page, limit, search);
  successResponse(res, 200, "CSR Categories fetched successfully", records);
});

export const getOne = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const record = await csrCategoryService.getCategoryById(id);

    if (!record) {
      throw new ApiError(404, "CSR Category not found");
    }

    successResponse(res, 200, "CSR Category fetched successfully", record);
  },
);

export const update = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const user = req.user as { id?: string };

    const record = await csrCategoryService.updateCategory(id, {
      ...req.body,
      updatedBy: user?.id,
    });

    successResponse(res, 200, "CSR Category updated successfully", record);
  },
);

export const remove = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    await csrCategoryService.deleteCategory(id);
    successResponse(res, 200, "CSR Category deleted successfully");
  },
);

export const changeSeq = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as { id?: string };
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const record = await csrCategoryService.getCategoryById(id);
    if (!record) {
      throw new ApiError(404, "CSR Category not found");
    }

    const updated = await csrCategoryService.updateSeq(id, {
      seq: Number(seq),
      updatedBy: user?.id,
    });

    successResponse(res, 200, "Sequence updated successfully", updated);
  },
);

export const changeStatus = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as { id?: string };
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
      status = status === "true" || status === "1";
    } else if (typeof status === "number") {
      status = status === 1;
    }

    const record = await csrCategoryService.getCategoryById(id);
    if (!record) {
      throw new ApiError(404, "CSR Category not found");
    }

    const updated = await csrCategoryService.updateStatus(
      id,
      status,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updated);
  },
);
