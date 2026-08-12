import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as mappingSubTypologiesService from "./mappingTypology.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };

  const record = await mappingSubTypologiesService.createMappingTypology({
    ...req.body,
    createdBy: user?.id,
  });

  successResponse(
    res,
    200,
    "Mapping typology - subtypology created successfully",
    record,
  );
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await mappingSubTypologiesService.getAllList(
    page,
    limit,
    search,
  );
  successResponse(res, 200, "Sub Typology records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await mappingSubTypologiesService.getSubTypologyById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  successResponse(res, 200, "Get edit sub typology record", record);
});

// export const update = asyncHandler(
//      async (req: Request, res: Response) => {
//           const user = req.user as { id?: string };
//           const id = req.params.id as string;
//           const oldRecord = await mappingSubTypologiesService.getSubTypologyById(id);

//           if(!oldRecord){
//                throw new ApiError(404, "Record not found");
//           }

//           const updatedRecord = await mappingSubTypologiesService.updateSubTypology(id, {
//                ...req.body,
//                updatedBy: user.id,
//           });

//           successResponse(res, 200, "Sub Typology updated successfully", updatedRecord);
//      }
// )

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await mappingSubTypologiesService.getSubTypologyById(id);

  if (!item) {
    throw new ApiError(404, "Sub Typology record not found");
  }
  await mappingSubTypologiesService.deleteSubTypology(id);
  successResponse(res, 200, "Sub Typology record deleted successfully");
});

export const getAllSubTypologies = asyncHandler(
  async (req: Request<{ typologyId: string }>, res: Response) => {
    const { typologyId } = req.params;

    const checkTypology =
      await mappingSubTypologiesService.getTypologyById(typologyId);
    if (!checkTypology) {
      throw new ApiError(404, "Typology record not found");
    }

    const result =
      await mappingSubTypologiesService.getSubTypesForTypology(typologyId);
    if (!result) {
      throw new ApiError(400, "Record not found");
    }

    successResponse(
      res,
      200,
      "Typology SubTypology fetched successfully",
      result,
    );
  },
);

export const getUnassignedSubTypes = asyncHandler(
  async (req: Request<{ typologyId: string }>, res: Response) => {
    const { typologyId } = req.params;

    const result =
      await mappingSubTypologiesService.getUnassignedSubTypes(typologyId);
    if (!result) {
      throw new ApiError(404, "Record not found");
    }

    successResponse(
      res,
      200,
      "Typology SubTypology fetched successfully",
      result,
    );
  },
);

export const removeAssignedSubType = asyncHandler(
  async (
    req: Request<{ typologyId: string; subTypologyId: string }>,
    res: Response,
  ) => {
    const { typologyId, subTypologyId } = req.params;

    await mappingSubTypologiesService.removeAssignedSubType(
      typologyId,
      subTypologyId,
    );

    successResponse(res, 200, "SubTypology removed from typology");
  },
);
