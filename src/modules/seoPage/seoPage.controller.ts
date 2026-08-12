import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as seoPageServices from "./seoPage.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const record = await seoPageServices.createSeoPage(req.body);
  successResponse(res, 200, "Seo page created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const footerId = req.params.footerId as string;

  const records = await seoPageServices.getAllSeoPages(
    page,
    limit,
    search,
    footerId,
  );

  successResponse(res, 200, "Seo pages fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await seoPageServices.getSeoPageById(id);

  if (!record) {
    throw new ApiError(404, "Seo page not found");
  }

  successResponse(res, 200, "Seo page fetched successfully", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const oldRecord = await seoPageServices.getSeoPageById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Seo page not found");
  }

  const record = await seoPageServices.updateSeoPage(id, req.body);
  successResponse(res, 200, "Seo page updated successfully", record);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await seoPageServices.getSeoPageById(id);

  if (!record) {
    throw new ApiError(404, "Seo page not found");
  }

  await seoPageServices.deleteSeoPage(id);
  successResponse(res, 200, "Seo page deleted successfully");
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

    const record = (seoPageServices as any).getById
      ? await (seoPageServices as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (seoPageServices as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
