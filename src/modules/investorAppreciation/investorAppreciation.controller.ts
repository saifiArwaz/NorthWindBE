import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import * as investorAppreciationService from "./investorAppreciation.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await investorAppreciationService.createInvestorAppreciation({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(
    res,
    201,
    "Investor appreciation record created successfully",
    record,
  );
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await investorAppreciationService.getAllList(
    page,
    limit,
    search,
  );

  successResponse(
    res,
    200,
    "Investor appreciation records fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await investorAppreciationService.getInvestorAppreciationById(id);

  successResponse(
    res,
    200,
    "Investor appreciation record fetched successfully",
    record,
  );
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = req.user as { id?: string };

  const record = await investorAppreciationService.updateInvestorAppreciation(
    id,
    {
      ...req.body,
      updatedBy: user?.id,
    },
  );

  successResponse(
    res,
    200,
    "Investor appreciation record updated successfully",
    record,
  );
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

    const record = await investorAppreciationService.getInvestorAppreciationById(id);
    if (!record) {
      throw new ApiError(404, "InvestorAppreciation record not found");
    }

    const updatedProject =
      await investorAppreciationService.updateSeq(id, payload);
    successResponse(
      res,
      200,
      "InvestorAppreciation seq successfully",
      updatedProject,
    );
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

    const record = await investorAppreciationService.getInvestorAppreciationById(id);
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await investorAppreciationService.updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);


export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await investorAppreciationService.deleteInvestorAppreciation(id);
  successResponse(
    res,
    200,
    "Investor appreciation record deleted successfully",
    record,
  );
});
