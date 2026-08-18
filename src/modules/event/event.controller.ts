import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as eventService from "./event.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const record = await eventService.createEvent({
    ...req.body,
    createdBy: user?.id,
  });
  successResponse(res, 200, "Event created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  
  const records = await eventService.getAllList(page, limit, search);
  successResponse(res, 200, "Events fetched successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await eventService.getEventByIdWithTree(id);

  if (!record) {
    throw new ApiError(404, "Event record not found");
  }

  successResponse(res, 200, "Event details fetched", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;
  
  const oldRecord = await eventService.getEventById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Event record not found");
  }

  const updatedRecord = await eventService.updateEvent(id, {
    ...req.body,
    updatedBy: user.id,
  });

  successResponse(res, 200, "Event updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const oldRecord = await eventService.getEventById(id);
  if (!oldRecord) {
    throw new ApiError(404, "Event record not found");
  }

  await eventService.deleteEvent(id);
  successResponse(res, 200, "Event record deleted successfully");
});

export const changeSeq = asyncHandler(
  async (req: Request<{ id: string }, any, any, { type?: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    const { seq } = req.body;

    if (isNaN(seq)) {
      throw new ApiError(400, "Seq value must be a number");
    }

    const payload: any = { seq: Number(seq), updatedBy: user.id };
    
    const record = await eventService.getEventById(id);
    if (!record) {
      throw new ApiError(404, "Event record not found");
    }

    const updated = await eventService.updateSeq(id, payload);
    successResponse(res, 200, "Event sequence updated successfully", updated);
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

    const record = await eventService.getEventById(id);
    if (!record) {
        throw new ApiError(404, "Event record not found");
    }

    const updated = await eventService.updateStatus(id, status as boolean, user?.id);
    successResponse(res, 200, "Event status updated successfully", updated);
  },
);
