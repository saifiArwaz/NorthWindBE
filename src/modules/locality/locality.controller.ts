import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as localityService from "./locality.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const createLocality = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await localityService.createLocality(req.body);
    successResponse(res, 201, "Locality created successfully", record);
  },
);

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await localityService.getAllList(page, limit, search);
  successResponse(res, 200, "Locality records fetched successfully", records);
});

export const getLocalityById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const record = await localityService.getLocalityById(id);

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    successResponse(res, 200, "Get Locality record", record);
  },
);

export const updateLocalityById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const oldRecord = await localityService.getLocalityById(id);

    if (!oldRecord) {
      throw new ApiError(404, "Record not found");
    }

    const updatedRecord = await localityService.updateLocality(id, req.body);
    successResponse(res, 200, "Locality updated successfully", updatedRecord);
  },
);

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await localityService.getLocalityById(id);

  if (!item) {
    throw new ApiError(404, "Locality record not found");
  }

  await localityService.deleteLocalityById(id);
  successResponse(res, 200, "Locality record deleted successfully");
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

    const record = (localityService as any).getById
      ? await (localityService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (localityService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
