import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as subTypologyService from "./SubTypology.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await subTypologyService.createSubTypology({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(res, 200, "Sub Typology created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await subTypologyService.getAllList(page, limit, search);
  successResponse(res, 200, "Sub Typology records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await subTypologyService.getSubTypologyById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  successResponse(res, 200, "Get edit sub typology record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  const oldRecord = await subTypologyService.getSubTypologyById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  const updatedRecord = await subTypologyService.updateSubTypology(id, {
    ...req.body,
    updatedBy: user.id,
  });

  successResponse(res, 200, "Sub Typology updated successfully", updatedRecord);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await subTypologyService.getSubTypologyById(id);

  if (!item) {
    throw new ApiError(404, "Sub Typology record not found");
  }
  await subTypologyService.deleteSubTypology(id);
  successResponse(res, 200, "Sub Typology record deleted successfully");
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

    const record = (subTypologyService as any).getById
      ? await (subTypologyService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (subTypologyService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
