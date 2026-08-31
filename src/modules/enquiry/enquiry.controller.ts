import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as enquiryService from "./enquiry.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import {
  getFileUrl,
} from "../../utils/fileHandling.utils.js";
import fs from "fs";
import path from "path";

export const getJobApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getJobApplication(page, limit, search);
    await Promise.all(
      records.data.map(async (data: any) => {
        if (data.resume) {
          if (data.resume) {
            data.resume = await getFileUrl(data.resume);
          }
        }
      }),
    );
    successResponse(res, 200, "City records fetch successfully", records);
  },
);

export const getNewsletterEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getNewsletterEnquiry(
      page,
      limit,
      search,
    );
    successResponse(
      res,
      200,
      "Newsletter enquiry records fetch successfully",
      records,
    );
  },
);

export const getProjectEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getProjectEnquiry(page, limit, search);
    successResponse(
      res,
      200,
      "Project enquiry records fetch successfully",
      records,
    );
  },
);

export const getContactEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getContactEnquiry(page, limit, search);
    successResponse(
      res,
      200,
      "Contact enquiry records fetch successfully",
      records,
    );
  },
);

export const downloadResumeJobApplication = asyncHandler(
  async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;
      const jobApp = await enquiryService.getJobApplicationById(id as string);

      if (!jobApp) {
        return next({
          status: 404,
          message: "Job Application Not Found",
        });
      }

      if (!jobApp.resume) {
        return next({
          status: 404,
          message: "Resume file not found",
        });
      }

      let fileKey = jobApp.resume;

      if (fileKey.includes("/files/")) {
        fileKey = fileKey.split("/files/").slice(1).join("/files/");
      } else if (
        fileKey.startsWith("http://") ||
        fileKey.startsWith("https://")
      ) {
        fileKey = fileKey.split("/").at(-1) || "";
      }

      const filePath = path.join(process.cwd(), "uploads", fileKey);

      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      } else {
        return next({
          status: 404,
          message: "Resume file not found on server",
        });
      }
    } catch (error: any) {
      next(error);
    }
  },
);

export const getFloorplanTowerEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getFloorplanTowerEnquiry(page, limit, search);
    successResponse(
      res,
      200,
      "Floorplan and tower enquiry records fetch successfully",
      records,
    );
  },
);

export const getLandOwnerConnectEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const enquiries = await enquiryService.getLandOwnerConnectEnquiry(
      page,
      limit,
      search,
    );
    successResponse(res, 200, "Land owner connect enquiries fetched successfully", enquiries);
  }
);
