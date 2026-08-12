import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as partnerCategoriesService from "./partnerCategories.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl, deleteFromS3 } from "../../utils/fileHandling.utils.js";
import type { IPartnerCategoriesUpdateDTO } from "./partnerCategories.interface.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await partnerCategoriesService.createPartnerCategories({
    ...req.body,
    createdBy: user?.id,
  });
 
  successResponse(res, 200, "Partners created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await partnerCategoriesService.getAllList(page, limit, search);
 
  successResponse(res, 200, "Partners records fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await partnerCategoriesService.getPartnerCategoriesById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  successResponse(res, 200, "Get Partners record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await partnerCategoriesService.getPartnerCategoriesById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }
 

  const updatePayload: IPartnerCategoriesUpdateDTO = {
    name: req.body.name,
    status:
      (req.body as any).status !== undefined
        ? (req.body as any).status === "true" ||
          (req.body as any).status === true
        : undefined,
    updatedBy: user.id,
  };

  const updatedRecord = await partnerCategoriesService.updatePartners(id, updatePayload);
 
  successResponse(res, 200, "Partners updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await partnerCategoriesService.getPartnerCategoriesById(id);

  if (!item) {
    throw new ApiError(404, "Partners record not found");
  }


  await partnerCategoriesService.deletePartnerCategories(id);
  successResponse(res, 200, "Partners record deleted successfully");
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

    const record = (partnerCategoriesService as any).getById
      ? await (partnerCategoriesService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (partnerCategoriesService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);


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

    const record = await partnerCategoriesService.getPartnerCategoriesById(id);
    if (!record) {
      throw new ApiError(404, "Partner record not found");
    }

    const updatedProject = await partnerCategoriesService.updatePartnerCategoriesSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Partner seq successfully", updatedProject);
  },
);
