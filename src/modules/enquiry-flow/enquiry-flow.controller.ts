import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import * as enquiryFlowService from "./enquiry-flow.service.js";
import type { LocationType } from "./enquiry-flow.service.js";

export const getPlatters = asyncHandler(
  async (_req: Request, res: Response) => {
    const platters = await enquiryFlowService.getEnquiryFlowPlatters();
    successResponse(
      res,
      200,
      "Enquiry flow platters fetched successfully",
      platters,
    );
  },
);

export const getLocations = asyncHandler(
  async (req: Request, res: Response) => {
    const { platterSlug } = req.query as { platterSlug: string };
    const result =
      await enquiryFlowService.getEnquiryFlowLocations(platterSlug);
    successResponse(
      res,
      200,
      "Enquiry flow locations fetched successfully",
      result,
    );
  },
);

export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  const { platterSlug, locationSlug, locationType } = req.query as {
    platterSlug: string;
    locationSlug?: string;
    locationType?: LocationType;
  };

  const result = await enquiryFlowService.getEnquiryFlowBudgets(
    platterSlug,
    locationSlug,
  );
  successResponse(
    res,
    200,
    "Enquiry flow budgets fetched successfully",
    result,
  );
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { platterSlug, locationSlug, minPrice, maxPrice, page, limit } =
    req.query as any;

  const projects = await enquiryFlowService.getEnquiryFlowProjects(
    platterSlug,
    locationSlug,
    minPrice,
    maxPrice,
    page ?? 1,
    limit ?? 10,
  );

  await Promise.all(
    projects.data.map(async (item: any) => {
      if (item.files && typeof item.files === "object" && item.files !== null) {
        for (const [key, value] of Object.entries(item.files)) {
          if (typeof value === "string" && value) {
            item.files[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );

  successResponse(
    res,
    200,
    "Enquiry flow projects fetched successfully",
    projects,
  );
});
