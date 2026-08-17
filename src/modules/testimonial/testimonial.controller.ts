import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as testimonialServices from "./testimonial.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";

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

  const record = await testimonialServices.createTestimonial({
    ...req.body,
    files: filesByFieldname,
    createdBy: user?.id,
  });

  if (record) {
    if (record.files && typeof record.files === "object") {
      const filesObj = record.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        }),
      );
    }
  }

  successResponse(res, 200, "Testimonial created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const fileType =
    req.query.fileType === "image" || req.query.fileType === "video"
      ? req.query.fileType
      : undefined;
  const records = await testimonialServices.getAllList(
    page,
    limit,
    search,
    fileType
  );
  await Promise.all(
    records.data.map(async (data: any) => {
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

  successResponse(res, 200, "Testimonials records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await testimonialServices.getTestimonialById(id);

  if (!record) {
    throw new ApiError(404, "Reocrd not found");
  }

  if (record) {
    if (record.files && typeof record.files === "object") {
      const filesObj = record.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        }),
      );
    }
  }

  successResponse(res, 200, "Get edit Testimonials record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await testimonialServices.getTestimonialById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  /** 1. Normalize uploaded files */
  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  /** 2. Parse existing files */
  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  /** 3. Track files to delete */
  const filesToDelete: string[] = [];

  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        filesToDelete.push(filesByFieldname[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  /** 4. Optional explicit file removal (frontend sends removeFiles[]) */
  if (Array.isArray(req.body.removeFiles)) {
    for (const field of req.body.removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  /** 5. Build PATCH-safe payload */
  const updatePayload = Object.fromEntries(
    Object.entries({
      name: req.body.name,
      link: req.body.link,
      fileType: req.body.fileType,
      description: req.body.description,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      isFeature: req.body.isFeature,
      isHome: req.body.isHome,
      status: req.body.status,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await testimonialServices.updateTestimonial(
    id,
    updatePayload,
  );

  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  /** 7. Attach presigned URLs */
  if (updatedRecord.files) {
    for (const key of Object.keys(updatedRecord.files as any)) {
      const value = (updatedRecord.files as any)[key];
      if (value) {
        (updatedRecord.files as any)[key] = await getFileUrl(value);
      }
    }
  }

  successResponse(res, 200, "Testimonials updated successfully", updatedRecord);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await testimonialServices.getTestimonialById(id);

  if (!item) {
    throw new ApiError(404, "Testimonials record not found");
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

  await testimonialServices.deleteTestimonialById(id);
  successResponse(res, 200, "Testimonials record deleted successfully");
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

    const record = await testimonialServices.getTestimonialById(id);
    if (!record) {
      throw new ApiError(404, "Banner record not found");
    }

    const updatedProject = await testimonialServices.updateProjectSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Testimonials seq successfully", updatedProject);
  },
);

export const chooseFeatureTestimonial = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const user = req.user!;
    const { id } = req.params;
    let { isFeature } = req.body;

    let payload: any = { updatedBy: user.id };

    if (
      !(
        typeof isFeature === "boolean" ||
        isFeature === "true" ||
        isFeature === "false" ||
        isFeature === 1 ||
        isFeature === 0 ||
        isFeature === "1" ||
        isFeature === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isFeature value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isFeature === "string") {
      if (isFeature === "true") isFeature = true;
      else if (isFeature === "false") isFeature = false;
      else if (isFeature === "1") isFeature = true;
      else if (isFeature === "0") isFeature = false;
    } else if (typeof isFeature === "number") {
      isFeature = isFeature === 1;
    }
    payload.isFeature = Boolean(isFeature);

    const record = await testimonialServices.getTestimonialById(id);
    if (!record) {
      throw new ApiError(404, "Testimonial record not found");
    }

    const updatedProject = await testimonialServices.updateTestimonialFeature(
      id,
      payload,
    );
    successResponse(res, 200, "Testimonials feature updated successfully", updatedProject);
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

    const record = (testimonialServices as any).getById
      ? await (testimonialServices as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (testimonialServices as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);

export const chooseHomeTestimonial = asyncHandler(
  async (
    req: Request<{ id: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const user = req.user!;
    const { id } = req.params;
    let { isHome } = req.body;

    let payload: any = { updatedBy: user.id };

    if (
      !(
        typeof isHome === "boolean" ||
        isHome === "true" ||
        isHome === "false" ||
        isHome === 1 ||
        isHome === 0 ||
        isHome === "1" ||
        isHome === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isHome value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isHome === "string") {
      if (isHome === "true") isHome = true;
      else if (isHome === "false") isHome = false;
      else if (isHome === "1") isHome = true;
      else if (isHome === "0") isHome = false;
    } else if (typeof isHome === "number") {
      isHome = isHome === 1;
    }
    payload.isHome = Boolean(isHome);

    const record = await testimonialServices.getTestimonialById(id);
    if (!record) {
      throw new ApiError(404, "Testimonial record not found");
    }

    const updatedProject = await testimonialServices.updateTestimonialHome(
      id,
      payload,
    );
    successResponse(
      res,
      200,
      "Testimonials isHome updated successfully",
      updatedProject,
    );
  },
);
