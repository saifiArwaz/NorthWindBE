import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as FaqService from "./faq.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const data: any = {
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  };

  const record = await FaqService.createFaq(data);

  successResponse(res, 200, "Faq created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await FaqService.getAllList(type, page, limit, search);

  successResponse(res, 200, "Faq records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await FaqService.getFaqById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  successResponse(res, 200, "Get edit Faq record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await FaqService.getFaqById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      type: req.body.type,
      question: req.body.question,
      answer: req.body.answer,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await FaqService.updateFaq(id, updatePayload);

  successResponse(res, 200, "Faq updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await FaqService.getFaqById(id);

  if (!item) {
    throw new ApiError(404, "Faq record not found");
  }

  await FaqService.deleteFaq(id);
  successResponse(res, 200, "Faq record deleted successfully");
});

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

    const record = await FaqService.getFaqById(id);
    if (!record) {
      throw new ApiError(404, "Faq record not found");
    }

    const updatedProject = await FaqService.updateSeq(id, payload);
    successResponse(res, 200, "Seq Updated successfully", updatedProject);
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

    const record = (FaqService as any).getById
      ? await (FaqService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (FaqService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
