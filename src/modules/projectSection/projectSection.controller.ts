import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import * as projectSectionService from "./projectSections.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import { S3UploadedFile } from "../../middlewares/multer-s3.middleware.js";

export const createOrUpdatePageSection = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { projectId, type } = req.body;

    const existedRecord =
      await projectSectionService.getProjectSectionBySectionType(
        projectId,
        type,
      );

    /* ------------------------------
             1. Normalize uploaded files
          ------------------------------ */
    const allFiles: any[] = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files ?? {}).flat();

    let filesByFieldname: Record<string, string> = {};

    allFiles.forEach((file: any) => {
      if (file.fieldname && file.key) {
        filesByFieldname[file.fieldname] = file.key;
      }
    });

    /* ------------------------------
             2. Prepare existing files
          ------------------------------ */
    let existingFiles: Record<string, string> = {};

    if (existedRecord?.files && typeof existedRecord.files === "object") {
      existingFiles = { ...(existedRecord.files as any) };
    }

    const filesToDelete: string[] = [];

    /* ------------------------------
             3. Replace old files
          ------------------------------ */
    for (const field in filesByFieldname) {
      if (existingFiles[field]) {
        filesToDelete.push(existingFiles[field]);
      }
      existingFiles[field] = filesByFieldname[field];
    }

    /* ------------------------------
             4. Optional removeFiles[]
          ------------------------------ */
    if (Array.isArray(req.body.removeFiles)) {
      for (const field of req.body.removeFiles) {
        if (existingFiles[field]) {
          filesToDelete.push(existingFiles[field]);
          delete existingFiles[field];
        }
      }
    }

    /* ------------------------------
             5. Payload
          ------------------------------ */
    const payload = {
      ...req.body,
      files: existingFiles,
      updatedBy: user.id,
      ...(existedRecord ? {} : { createdBy: user.id }),
    };

    let record;

    if (existedRecord) {
      record = await projectSectionService.updateProjectSection(
        existedRecord.id,
        payload,
      );
    } else {
      record = await projectSectionService.createProjectSection(payload);
    }

    /* ------------------------------
             6. Delete old S3 files
          ------------------------------ */
    for (const key of filesToDelete) {
      await deleteFromS3(key);
    }

    /* ------------------------------
             7. Generate presigned URLs
          ------------------------------ */
    if (record?.files && typeof record.files === "object") {
      const filesObj = record.files as any;

      await Promise.all(
        Object.keys(filesObj).map(async (k) => {
          if (filesObj[k]) {
            filesObj[k] = await getFileUrl(filesObj[k]);
          }
        }),
      );
    }

    successResponse(
      res,
      existedRecord ? 200 : 201,
      existedRecord
        ? "Section updated successfully"
        : "Section created successfully",
      record,
    );
  },
);

export const getAll = asyncHandler(
  async (
    req: Request<
      { projectId: string },
      { page: number; limit: number; search: string }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const projectId = (req.params.projectId as string) || "";

    const record = await projectSectionService.getAllProjectSection(
      projectId,
      page,
      limit,
      search,
    );
    await Promise.all(
      record.data.map(async (item: any) => {
        if (item.files) {
          const keys = Object.keys(item.files);

          for (const key of keys) {
            const value = item.files[key];
            item.files[key] = await getFileUrl(value);
          }
        }
      }),
    );

    successResponse(res, 200, "Page fetched successfully", record);
  },
);

export const getProjectSectionList = asyncHandler(
  async (
    req: Request<{ page: number; limit: number }, { search: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const record = await projectSectionService.getAllProjectSectionList(
      page,
      limit,
      search,
    );
    await Promise.all(
      record.data.map(async (item: any) => {
        if (item.files) {
          const keys = Object.keys(item.files);

          for (const key of keys) {
            const value = item.files[key];
            item.files[key] = await getFileUrl(value);
          }
        }
      }),
    );

    successResponse(res, 200, "Page fetched successfully", record);
  },
);

export const getOne = asyncHandler(
  async (
    req: Request<{ projectId: string; sectionType: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { projectId, sectionType } = req.params;

    const record = await projectSectionService.getProjectSectionBySectionType(
      projectId,
      sectionType,
    );
    if (!record) {
      return next(new ApiError(404, "Project Section not found"));
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

    successResponse(res, 200, "Project Section fetched successfully", record);
  },
);

export const remove = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const record = await projectSectionService.getProjectSectionById(
      id as string,
    );

    if (!record) {
      return next(new ApiError(404, "Page not found"));
    }

    // const fileFields = [];
    // if (record.files && typeof record.files === 'object') {
    //      const filesObj = record.files as any;
    //      for (const key of Object.keys(filesObj)) {
    //           if (filesObj[key]) {
    //                fileFields.push(filesObj[key]);
    //           }
    //      }
    // }
    // for (const file of fileFields) {
    //      file && await deleteFromS3(file);
    // }

    await projectSectionService.deleteProjectSection(id as string);

    successResponse(res, 200, "PageSection deleted successfully");
  },
);

export const destroySinglefile = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const keyToDelete = req.body.key as string;

    if (!keyToDelete) {
      throw new ApiError(400, "File key to delete is required");
    }

    const pageSection = await projectSectionService.getProjectSectionById(id);
    if (!pageSection) {
      throw new ApiError(404, "Page section not found");
    }

    let filesObj: Record<string, any> = {};

    if (pageSection.files && typeof pageSection.files === "object") {
      filesObj = { ...(pageSection.files as any) };
    } else {
      throw new ApiError(400, "Files object is not present or invalid");
    }

    const fileKeyValue = filesObj[keyToDelete];
    if (!fileKeyValue) {
      throw new ApiError(404, "File key not found in files object");
    }

    await deleteFromS3(fileKeyValue);
    delete filesObj[keyToDelete];

    const updatedRecord = await projectSectionService.updateProjectSection(id, {
      files: filesObj,
    } as any);

    successResponse(
      res,
      200,
      "File deleted and files object updated successfully",
    );
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

    const record = await projectSectionService.getProjectSectionById(id);
    if (!record) {
      throw new ApiError(404, "Banner record not found");
    }

    const updatedProject = await projectSectionService.updateSeq(id, payload);
    successResponse(
      res,
      200,
      "Project Banner seq successfully",
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

    const record = (projectSectionService as any).getById
      ? await (projectSectionService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (projectSectionService as any).updateStatus(
      id,
      status as boolean,
      user?.id,
    );

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
