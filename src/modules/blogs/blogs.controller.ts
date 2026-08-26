import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as blogService from "./blogs.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import type { S3UploadedFile } from "../../middlewares/multer-s3.middleware.js";

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

  const description =
    typeof req.body.description === "string"
      ? JSON.parse(req.body.description)
      : req.body.description;

  const record = await blogService.createBlog({
    ...req.body,
    description,
    ...(req.body.dateAt ? { dateAt: new Date(req.body.dateAt) } : {}),
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

  successResponse(res, 200, "Blog created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const records = await blogService.getAllBlog(page, limit, search);
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

  successResponse(res, 200, "Page records fetch successfully", records);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await blogService.getBlogById(id);

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

  successResponse(res, 200, "Get edit page record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await blogService.getBlogById(id);
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
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      files: filesByFieldname,
      alt: req.body.alt,
      watermark: req.body.watermark,
      seoTags: req.body.seoTags,
      dateAt: req.body.dateAt ? new Date(req.body.dateAt) : undefined,
      status: req.body.status,
      isFeature: req.body.isFeature,
      isHome: req.body.isHome,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await blogService.updateBlog(id, updatePayload);

  /** 6. Delete old files AFTER DB update */
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

  successResponse(res, 200, "Blog updated successfully", updatedRecord);
});

export const deleteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const page = await blogService.getBlogById(id);

  if (!page) {
    throw new ApiError(404, "Blog not found");
  }
  // const fileFields = [];
  // if (page.files && typeof page.files === 'object') {
  //      const filesObj = page.files as any;
  //      for (const key of Object.keys(filesObj)) {
  //           if (filesObj[key]) {
  //                fileFields.push(filesObj[key]);
  //           }
  //      }
  // }
  // for (const file of fileFields) {
  //      file && await deleteFromS3(file);
  // }

  await blogService.deleteBlogById(id);
  successResponse(res, 200, "Blog deleted successfully");
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

    const record = (blogService as any).getById
      ? await (blogService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (blogService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);

export const changeisLatest = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { isLatest } = req.body;

    if (
      !(
        typeof isLatest === "boolean" ||
        isLatest === "true" ||
        isLatest === "false" ||
        isLatest === 1 ||
        isLatest === 0 ||
        isLatest === "1" ||
        isLatest === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isLatest value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isLatest === "string") {
      if (isLatest === "true") isLatest = true;
      else if (isLatest === "false") isLatest = false;
      else if (isLatest === "1") isLatest = true;
      else if (isLatest === "0") isLatest = false;
    } else if (typeof isLatest === "number") {
      isLatest = isLatest === 1;
    }

    const record = (blogService as any).getById
      ? await (blogService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (blogService as any).updateIsLatest(
      id,
      isLatest as boolean,
      user?.id,
    );

    successResponse(res, 200, "isLatest updated successfully", updatedRecord);
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

    const record = await blogService.getBlogById(id);
    if (!record) {
      throw new ApiError(404, "Blog record not found");
    }

    const updatedProject = await blogService.updateBlogsSeq(
      id,
      payload,
    );
    successResponse(res, 200, "Blog seq successfully", updatedProject);
  },
);

export const changeisFeatured = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { isFeature } = req.body;

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
      if (isFeature === "true") isFeature  = true;
      else if (isFeature === "false") isFeature = false;
      else if (isFeature === "1") isFeature = true;
      else if (isFeature === "0") isFeature = false;
    } else if (typeof isFeature === "number") {
      isFeature = isFeature === 1;
    }

    const record = (blogService as any).getById
      ? await (blogService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (blogService as any).updateIsFeature(
      id,
      isFeature as boolean,
      user?.id,
    );

    successResponse(res, 200, "isFeature   updated successfully", updatedRecord);
  },
);

export const changeisHome = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    let { isHome } = req.body;

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

    const updatedRecord = await (blogService as any).updateIsHome(
      id,
      isHome as boolean,
      user?.id,
    );

    successResponse(res, 200, "isHome updated successfully", updatedRecord);
  },
);