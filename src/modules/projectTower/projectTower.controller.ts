import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectTowerService from "./projectTower.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import * as projectService from "../projects/project.service.js";
import { deleteFromS3, getFileUrl } from "../../utils/fileHandling.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

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

  const record = await projectTowerService.createProjectTower({
    ...req.body,
    files: filesByFieldname,
    createdBy: user.id,
    updatedBy: user.id,
  });

  if (record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(Object.keys(filesObj).map(async (key) => {
      if (filesObj[key]) filesObj[key] = await getFileUrl(filesObj[key]);
    }));
  }

  successResponse(res, 200, "Project Tower created successfully", record);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const projectId = req.query.projectId as string | undefined;

  if (projectId) {
    const record = await projectService.getProjectById(projectId);
    if (!record) {
      throw new ApiError(404, "Invalid Project Id");
    }
  }

  const records = await projectTowerService.getAllList(
    page,
    limit,
    search,
    projectId,
  );

  await Promise.all(
    records.data.map(async (data: any) => {
      if (data.files && typeof data.files === "object") {
        const filesObj = data.files as any;
        await Promise.all(
          Object.keys(filesObj).map(async (key) => {
            if (filesObj[key]) filesObj[key] = await getFileUrl(filesObj[key]);
          })
        );
      }
    })
  );

  successResponse(
    res,
    200,
    "Project Tower records fetched successfully",
    records,
  );
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const record = await projectTowerService.getProjectTowerById(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  if (record.files && typeof record.files === "object") {
    const filesObj = record.files as any;
    await Promise.all(Object.keys(filesObj).map(async (key) => {
      if (filesObj[key]) filesObj[key] = await getFileUrl(filesObj[key]);
    }));
  }

  successResponse(res, 200, "Get edit page record", record);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as { id?: string };
  const id = req.params.id as string;

  const oldRecord = await projectTowerService.getProjectTowerById(id);

  if (!oldRecord) {
    throw new ApiError(404, "Record not found");
  }

  let slug = oldRecord.slug;
  if (req.body.name) {
    slug = slugify(req.body.slug || req.body.name, {
      lower: true,
      strict: true,
    });
    const exists = await projectTowerService.findFirst(id, slug!);
    if (exists) {
      throw new ApiError(404, "Project tower name already exists");
    }
  }

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  if (oldRecord.files && typeof oldRecord.files === "object") {
    filesByFieldname = { ...(oldRecord.files as any) };
  }

  const filesToDelete: string[] = [];

  for (const file of allFiles) {
    if (file.fieldname && file.key) {
      if (filesByFieldname[file.fieldname]) {
        filesToDelete.push(filesByFieldname[file.fieldname]);
      }
      filesByFieldname[file.fieldname] = file.key;
    }
  }

  if (Array.isArray(req.body.removeFiles)) {
    for (const field of req.body.removeFiles) {
      if (filesByFieldname[field]) {
        filesToDelete.push(filesByFieldname[field]);
        delete filesByFieldname[field];
      }
    }
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      name: req.body.name,
      slug: slug,
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
      list: req.body.list,
      files: Object.keys(filesByFieldname).length ? filesByFieldname : undefined,
      alt: req.body.alt,
      watermark: req.body.watermark,
      updatedBy: user.id,
    }).filter(([_, v]) => v !== undefined),
  );

  const updatedRecord = await projectTowerService.updateProjectTower(id, updatePayload);

  for (const file of filesToDelete) {
    await deleteFromS3(file);
  }

  if (updatedRecord.files) {
    for (const key of Object.keys(updatedRecord.files as any)) {
      const value = (updatedRecord.files as any)[key];
      if (value) (updatedRecord.files as any)[key] = await getFileUrl(value);
    }
  }

  successResponse(
    res,
    200,
    "Project Tower updated successfully",
    updatedRecord,
  );
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await projectTowerService.getProjectTowerById(id);

  if (!item) {
    throw new ApiError(404, "Record not found");
  }

  await projectTowerService.deleteProjectTower(id);
  successResponse(res, 200, "Project Tower deleted successfully");
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

    const record = await projectTowerService.getProjectTowerById(id);
    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    const updated = await projectTowerService.updateSeq(id, payload);
    successResponse(res, 200, "Seq Updated successfully", updated);
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

    const record = (projectTowerService as any).getById
      ? await (projectTowerService as any).getById(id)
      : null;
    // We bypass getById check here if not universally named, the service updateStatus will throw if not found.

    const updatedRecord = await (
      projectTowerService as any
    ).updateStatus(id, status as boolean, user?.id);

    successResponse(res, 200, "Status updated successfully", updatedRecord);
  },
);
