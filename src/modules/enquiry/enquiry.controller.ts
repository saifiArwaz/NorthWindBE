import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as enquiryService from "./enquiry.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import {
  getFileUrl,
  getPresignedUrlForDownload,
} from "../../utils/fileHandling.utils.js";

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

export const getOrangeCircleEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getOrangeCircleEnquiry(
      page,
      limit,
      search,
    );
    successResponse(
      res,
      200,
      "Orange circle enquiry records fetch successfully",
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

export const getChannelPartnerEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const records = await enquiryService.getChannelPartnerEnquiry(
      page,
      limit,
      search,
    );
    successResponse(
      res,
      200,
      "Channel partner enquiry records fetch successfully",
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

      const url = await getPresignedUrlForDownload(jobApp.resume, 60 * 60 * 24);
      return res.redirect(url);
    } catch (error: any) {
      next(error);
    }
  },
);
