import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectService from "./project.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { deleteFromS3 } from "../../utils/fileHandling.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { serializeBigInt } from "../../utils/serialize.utils.js";

export const getFilterList = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await projectService.getFilterList();
    successResponse(res, 200, "Filters fetched successfully", data);
  },
);

export const getAll = asyncHandler(
  async (
    req: Request<
      { page: number; limit: number },
      { search: string; platter: string; projectstatus: string }
    >,
    res: Response,
  ) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const platterId = req.query.platter as string | undefined;
    const projectStatusId = req.query.projectstatus as string | undefined;
    const feature = req.query.feature as string | undefined;

    const record = await projectService.getAllProject(
      page,
      limit,
      search,
      platterId,
      projectStatusId,
      feature,
    );

    await Promise.all(
      record.data.map(async (data: any) => {
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

    successResponse(
      res,
      200,
      "Projects fetched successfully",
      serializeBigInt(record),
    );
  },
);

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const allFiles: any[] = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files ?? {}).flat();

  let filesByFieldname: Record<string, string> = {};
  allFiles.forEach((file: any) => {
    if (file.fieldname && file.key) {
      filesByFieldname[file.fieldname] = file.key;
    }
  });

  const record = await projectService.createProject({
    ...req.body,
    files: filesByFieldname,
    createdBy: user.id,
    updatedBy: user.id,
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

  successResponse(
    res,
    201,
    "Project created successfully",
    serializeBigInt(record),
  );
});

export const getOne = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const record = await projectService.getProjectById(id);
    if (!record) {
      throw new ApiError(404, "Project not found");
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

    successResponse(
      res,
      200,
      "Project fetched successfully",
      serializeBigInt(record),
    );
  },
);

export const update = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    const oldRecord = await projectService.getProjectById(id);
    if (!oldRecord) {
      throw new ApiError(404, "Record not found");
    }

    let slug = oldRecord.slug;
    if (req.body.projectName) {
      slug = slugify(req.body.slug || req.body.projectName, {
        lower: true,
        strict: true,
      });
      const exists = await projectService.findFirst(id, slug);
      if (exists) {
        throw new ApiError(404, "Project name already exists");
      }
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
        projectName: req.body.projectName,
        slug,
        cityId: req.body.cityId,
        platterId: req.body.platterId,
        typologyId: req.body.typologyId,
        subTypologyId: req.body.subTypologyId,
        projectStatusId: req.body.projectStatusId,
        location: req.body.location,
        files: filesByFieldname,
        brochure: req.body.brochure,
        type: req.body.type,
        shortDescription: req.body.shortDescription,
        alt: req.body.alt,
        watermark: req.body.watermark,
        seoTags: req.body.seoTags,
        otherDetails: req.body.otherDetails,
        updatedBy: user.id,
      }).filter(([_, v]) => v !== undefined),
    );

    const updatedRecord = await projectService.updateProject(id, updatePayload);

    // Actually delete replaced/removed files from S3 if any
    for (const fileKey of filesToDelete) {
      await deleteFromS3(fileKey);
    }

    // Re-populate signed URLs for return
    if (
      updatedRecord &&
      updatedRecord.files &&
      typeof updatedRecord.files === "object"
    ) {
      const filesObj = updatedRecord.files as any;
      await Promise.all(
        Object.keys(filesObj).map(async (key) => {
          if (filesObj[key]) {
            filesObj[key] = await getFileUrl(filesObj[key]);
          }
        }),
      );
    }

    successResponse(
      res,
      200,
      "Project updated successfully",
      serializeBigInt(updatedRecord),
    );
  },
);

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const project = await projectService.getProjectById(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const fileFields = [];
  if (project.files && typeof project.files === "object") {
    const filesObj = project.files as any;
    for (const key of Object.keys(filesObj)) {
      if (filesObj[key]) {
        fileFields.push(filesObj[key]);
      }
    }
  }
  for (const file of fileFields) {
    file && (await deleteFromS3(file));
  }

  await projectService.deleteProject(id);

  successResponse(res, 200, "Project deleted successfully");
});

export const destroySinglefile = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const keyToDelete = req.body.key as string;

    if (!keyToDelete) {
      throw new ApiError(400, "File key to delete is required");
    }

    const pageSection = await projectService.getProjectById(id);
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

    const updatedRecord = await projectService.updateProject(id, {
      files: filesObj,
    });

    successResponse(
      res,
      200,
      "File deleted and files object updated successfully",
    );
  },
);

export const changeStatus = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
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

    const project = await projectService.getProjectById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectService.updateProjectStatus(
      id,
      status,
      user.id,
    );

    successResponse(
      res,
      200,
      "Status column updated successfully",
      serializeBigInt(updatedproject),
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

    const record = await projectService.getProjectById(id);
    if (!record) {
      throw new ApiError(404, "Project record not found");
    }

    const updatedProject = await projectService.updateProjectSeq(id, payload);
    successResponse(
      res,
      200,
      "Project seq successfully",
      serializeBigInt(updatedProject),
    );
  },
);

export const chooseFeatureProject = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
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
      if (isFeature === "true") isFeature = true;
      else if (isFeature === "false") isFeature = false;
      else if (isFeature === "1") isFeature = true;
      else if (isFeature === "0") isFeature = false;
    } else if (typeof isFeature === "number") {
      isFeature = isFeature === 1;
    }

    const project = await projectService.getProjectById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectService.updateProjectFeature(
      id,
      isFeature,
      user.id,
    );

    successResponse(
      res,
      200,
      "isFeature column updated successfully",
      serializeBigInt(updatedproject),
    );
  },
);

export const chooseHomeProject = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
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
        "feature value must be a boolean (true or false), 1/0 or 'true'/'false'",
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

    const project = await projectService.getProjectById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectService.updateProjectIsHome(
      id,
      isHome,
      user.id,
    );

    successResponse(
      res,
      200,
      "isHome column updated successfully",
      serializeBigInt(updatedproject),
    );
  },
);


export const chooseIsPageProject = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    let { isPage } = req.body;

    if (
      !(
        typeof isPage === "boolean" ||
        isPage === "true" ||
        isPage === "false" ||
        isPage === 1 ||
        isPage === 0 ||
        isPage === "1" ||
        isPage === "0"
      )
    ) {
      throw new ApiError(
        400,
        "Is Page value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isPage === "string") {
      if (isPage === "true") isPage = 1;
      else if (isPage === "false") isPage = 0;
      else if (isPage === "1") isPage = 1;
      else if (isPage === "0") isPage = 0;
    } else if (typeof isPage === "number") {
      isPage = isPage === 1;
    }

    const project = await projectService.getProjectById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectService.updateProjectIsPage(
      id,
      isPage,
      user.id,
    );

    successResponse(
      res,
      200,
      "Is Page column updated successfully",
      serializeBigInt(updatedproject),
    );
  },
);

export const chooseIsPast = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    let { isPast } = req.body;

    if (
      !(
        typeof isPast === "boolean" ||
        isPast === "true" ||
        isPast === "false" ||
        isPast === 1 ||
        isPast === 0 ||
        isPast === "1" ||
        isPast === "0"
      )
    ) {
      throw new ApiError(
        400,
        "isPast value must be a boolean (true or false), 1/0 or 'true'/'false'",
      );
    }

    if (typeof isPast === "string") {
      if (isPast === "true") isPast = true;
      else if (isPast === "false") isPast = false;
      else if (isPast === "1") isPast = true;
      else if (isPast === "0") isPast = false;
    } else if (typeof isPast === "number") {
      isPast = isPast === 1;
    }

    const project = await projectService.getProjectById(id);
    if (!project) {
      throw new ApiError(404, "project not found");
    }

    const updatedproject = await projectService.updateProjectIsPast(
      id,
      isPast,
      user.id,
    );

    successResponse(
      res,
      200,
      "isPast column updated successfully",
      serializeBigInt(updatedproject),
    );
  },
);

