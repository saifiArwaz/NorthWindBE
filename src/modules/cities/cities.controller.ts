import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as citiesService from "./cities.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";

export const createCities = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as { id?: string };

    const seoTags = req.body?.seoTags ?? {};

    const record = await citiesService.createCity({
      ...req.body,
      seoTags: seoTags,
      createdBy: user?.id,
    });

    successResponse(res, 200, "City created successfully", record);
  },
);

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await citiesService.getAllList(page, limit, search);
  successResponse(res, 200, "City records fetch successfully", records);
});

export const getCitiesById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const record = await citiesService.getCityById(id);

    if (!record) {
      throw new ApiError(404, "Reocrd not found");
    }

    successResponse(res, 200, "Get edit City record", record);
  },
);

export const updateCitiesById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as { id?: string };
    const id = req.params.id as string;
    const oldRecord = await citiesService.getCityById(id);

    if (!oldRecord) {
      throw new ApiError(404, "Record not found");
    }

    const seoTags = req.body?.seoTags ?? {};
    const updatePayload: any = {
      ...req.body,
      seoTags: seoTags,
      updatedBy: user.id,
    };

    const updatedRecord = await citiesService.updateCity(id, updatePayload);

    successResponse(res, 200, "City updated successfully", updatedRecord);
  },
);

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await citiesService.getCityById(id);

  if (!item) {
    throw new ApiError(404, "City record not found");
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

  await citiesService.deleteCityById(id);
  successResponse(res, 200, "City record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const record = await citiesService.getCityById(id);
    if (!record) {
      throw new ApiError(404, "City record not found");
    }

    const updatedRecord = await citiesService.updateSeq(id, Number(seq), user?.id);
    successResponse(res, 200, "Seq updated successfully", updatedRecord);
  }
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

    const record = (citiesService as any).getById
      ? await (citiesService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (citiesService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
