import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectService from "./project.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  // Extract filters from query parameters
  const {
    search,
    platterIds,
    cityIds,
    projectStatusIds,
    isHome,
    isPastProject,
    page,
    limit,
  } = req.query;

  // Parse & prepare filter params
  const filterParams: any = {};
  if (search !== undefined) {
    filterParams.search = search;
  }
  if (platterIds !== undefined) {
    filterParams.platterIds = platterIds;
  }
  if (isHome !== undefined) {
    filterParams.isHome = isHome;
  }
  if (isPastProject !== undefined) {
    filterParams.isPastProject = isPastProject;
  }
  if (cityIds !== undefined) {
    filterParams.cityIds = cityIds;
  }
  if (projectStatusIds !== undefined) {
    filterParams.projectStatusIds = projectStatusIds;
  }
  const parseBoolean = (value: any): boolean | undefined => {
    if (value === undefined) return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return undefined;
  };
  if (page !== undefined) {
    filterParams.page = Number(page);
  }
  if (limit !== undefined) {
    filterParams.limit = Number(limit);
  }

  // Call service with filters
  const projects = await projectService.getProjects(filterParams);
  if (projects) {
    await Promise.all(
      projects.data.map(async (item: any) => {
        if (
          item.files &&
          typeof item.files === "object" &&
          item.files !== null
        ) {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              item.files[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
  }

  successResponse(res, 200, "Projects fetched successfully", projects);
});

export const getProjectDetailsBySlug = asyncHandler(
  async (
    req: Request<{ platterSlug: string; slug: string }>,
    res: Response,
  ) => {
    const { platterSlug, slug } = req.params;

    if (!slug) {
      throw new ApiError(400, "slug parameter is required");
    }

    const project = await projectService.getProjectBySlug(platterSlug, slug);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (project) {
      if (project?.brochure) {
        project.brochure = await getFileUrl(project.brochure);
      }
      if (project?.files) {
        for (const key of Object.keys(project.files as any)) {
          const value = (project.files as any)[key];
          if (value) {
            (project.files as any)[key] = await getFileUrl(value);
          }
        }
      }
      if (Array.isArray(project.projectSection)) {
        await Promise.all(
          project.projectSection.map(async (section: any) => {
            for (const key of Object.keys(section.files as any)) {
              const value = (section.files as any)[key];
              if (value) {
                (section.files as any)[key] = await getFileUrl(value);
              }
            }
          }),
        );
      }
    }
    successResponse(res, 200, "Project fetched successfully", project);
  },
);

export const getProjectGalleriesByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }
    const fileTypes =
      typeof req.query.fileTypes === "string"
        ? req.query.fileTypes
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : [];

    const galleries = await projectService.getProjectGalleriesByProjectId(
      projectId,
      fileTypes.length > 0 ? fileTypes : undefined,
    );

    await Promise.all(
      galleries.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(
      res,
      200,
      "Project galleries fetched successfully",
      galleries,
    );
  },
);

export const getProjectAmenitiesByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const record =
      await projectService.getProjectAmenitiesByProjectId(projectId);

    await Promise.all(
      record.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
        if (item.amenities && typeof item.amenities === "object") {
          for (const [key, value] of Object.entries(item.amenities.files)) {
            if (typeof value === "string" && value) {
              (item.amenities.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(res, 200, "Project amenities fetched successfully", record);
  },
);

export const getProjectFloorPlansByProjectId = asyncHandler(
  async (
    req: Request<{ projectId: string }, any, any, { type?: string; towerId?: string }>,
    res: Response,
  ) => {
    const { projectId } = req.params;
    const { type, towerId } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    // Support filtering by type
    const validTypes = ["floorplan", "masterplan"];
    let planType: string | undefined = undefined;

    if (type) {
      if (!validTypes.includes(type.toLowerCase())) {
        throw new ApiError(
          400,
          `Invalid type. Supported types are: ${validTypes.join(", ")}`,
        );
      }
      planType = type.toLowerCase();
    }

    const floorPlans = await projectService.getProjectFloorPlansByProjectId(
      projectId,
      planType,
      planType === "masterplan" ? undefined : towerId,
    );

    // Handle presigned URLs for images
    await Promise.all(
      floorPlans.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(
      res,
      200,
      `Project floor plans${planType ? ` (${planType})` : ""} fetched successfully`,
      floorPlans,
    );
  },
);


export const getProjectLocationAdvantageByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const locationAdvantages =
      await projectService.getProjectLocationAdvantageByProjectId(projectId);

    successResponse(
      res,
      200,
      "Project location advantages fetched successfully",
      locationAdvantages,
    );
  },
);

export const getProjectContentDetailsByType = asyncHandler(
  async (
    req: Request, res: Response,
  ) => {
    const projectId = req.params.projectId as string;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const records = await projectService.getProjectContentDetailsByType(
      projectId
    );

    await Promise.all(
      records.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(
      res,
      200,
      `Project content details fetched successfully`,
      records,
    );
  },
);

export const getProjectConstructionUpdates = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { towerId, year, month } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const parsedYear = year ? Number(year) : undefined;
    const parsedMonth = month ? Number(month) : undefined;

    if (year && !Number.isInteger(parsedYear)) {
      throw new ApiError(400, "Invalid year");
    }

    if (
      month &&
      (
        parsedMonth === undefined ||
        !Number.isInteger(parsedMonth) ||
        parsedMonth < 1 ||
        parsedMonth > 12
      )
    ) {
      throw new ApiError(400, "Invalid month");
    }
    const record = await projectService.getProjectConstructionUpdates(
      projectId as string,
      parsedYear,
      parsedMonth
    );

    // Resolve gallery file URLs
    if (record.galleries) {
      for (const gallery of record.galleries) {
        if (gallery.files && typeof gallery.files === "object") {
          for (const [key, value] of Object.entries(gallery.files)) {
            if (value && typeof value === "string") {
              (gallery.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }
    }

    successResponse(
      res,
      200,
      "Construction updates fetched successfully",
      record
    );
  }
);

export const getProjectTowersByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const towers = await projectService.getProjectTowersByProjectId(projectId);

    await Promise.all(
      towers.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(res, 200, "Project towers fetched successfully", towers);
  }
);


export const getProjectFaqsByProjectId = asyncHandler(
  async (
    req: Request<{ projectId: string }>, // <-- FIX: ADD TYPE HERE
    res: Response,
  ) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const faqs = await projectService.getProjectFaqsByProjectId(projectId);

    successResponse(res, 200, "Project FAQs fetched successfully", faqs);
  },
);

export const getProjectMasterPlanDataByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;
    const { categoryId } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const { categories } = await projectService.getProjectMasterPlanData(
      projectId,
      categoryId as string | undefined,
    );

    successResponse(res, 200, "Project master plan data fetched successfully", { categories });
  }
);

export const getProjectMasterPlanPinGalleriesByPinId = asyncHandler(
  async (req: Request<{ pinId: string }>, res: Response) => {
    const { pinId } = req.params;

    if (!pinId) {
      throw new ApiError(400, "pinId parameter is required");
    }

    const galleries = await projectService.getProjectMasterPlanPinGalleries(pinId);

    await Promise.all(
      galleries.map(async (gallery: any) => {
        if (gallery.files && typeof gallery.files === "object") {
          for (const [key, value] of Object.entries(gallery.files)) {
            if (typeof value === "string" && value) {
              (gallery.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      })
    );

    successResponse(res, 200, "Project master plan pin galleries fetched successfully", galleries);
  }
);

