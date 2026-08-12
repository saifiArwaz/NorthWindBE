import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { getSeoProjects, getFooterLinks } from "./seo.service.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";

export const getSeoPage = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const record = await getSeoProjects(slug);

  await Promise.all(
    record.projects.map(async (data: any) => {
      if (data.files && typeof data.files === "object") {
        const filesObj = data.files as any;
        await Promise.all(
          Object.keys(filesObj).map(async (key) => {
            if (filesObj[key]) {
              filesObj[key] = await getFileUrl(filesObj[key]);
            }
          }),
        );
      }
    }),
  );

  successResponse(res, 200, "Seo page records fetched successfully", record);
});

export const getSeoFooterLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await getFooterLinks();

    successResponse(res, 200, "Seo footer links fetched successfully", record);
  },
);
