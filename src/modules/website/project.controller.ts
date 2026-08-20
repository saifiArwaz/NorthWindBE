import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import * as projectService from "./project.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { getFileUrl } from "../../utils/fileHandling.utils.js";
import { MediaType } from "../../generated/prisma/enums.js";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  // Extract filters from query parameters
  const {
    search,
    platterIds,
    cityIds,
    localityIds,
    subTypologyIds,
    projectStatusIds,
    minPrice,
    maxPrice,
    isFeature,
    isLuxuryLocation,
    isNewLaunch,
    isPage,
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
  if (cityIds !== undefined) {
    filterParams.cityIds = cityIds;
  }
  if (localityIds !== undefined) {
    filterParams.localityIds = localityIds;
  }
  if (subTypologyIds !== undefined) {
    filterParams.subTypologyIds = subTypologyIds;
  }
  if (projectStatusIds !== undefined) {
    filterParams.projectStatusIds = projectStatusIds;
  }
  if (minPrice !== undefined) {
    filterParams.minPrice = Number(minPrice);
  }
  if (maxPrice !== undefined) {
    filterParams.maxPrice = Number(maxPrice);
  }
  const parseBoolean = (value: any): boolean | undefined => {
    if (value === undefined) return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return undefined;
  };

  if (isFeature !== undefined) {
    filterParams.isFeature = parseBoolean(isFeature);
  }

  if (isLuxuryLocation !== undefined) {
    filterParams.isLuxuryLocation = Number(isLuxuryLocation);
  }

  if (isPage !== undefined) {
    filterParams.isPage = parseBoolean(isPage);
  }

  if (page !== undefined) {
    filterParams.page = Number(page);
  }
  if (limit !== undefined) {
    filterParams.limit = Number(limit);
  }

  if (isNewLaunch !== undefined) {
    filterParams.isNewLaunch = parseBoolean(isNewLaunch);
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
        await Promise.all(
          item.projectBanner.map(async (banner: any) => {
            if (banner.files && typeof banner.files === "object") {
              for (const [key, value] of Object.entries(banner.files)) {
                if (typeof value === "string" && value) {
                  (banner.files as any)[key] = await getFileUrl(value);
                }
              }
            }
          }),
        );
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

    const types =
      typeof req.query.projectGalleryTypes === "string"
        ? req.query.projectGalleryTypes
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    const fileTypes =
      typeof req.query.projectGalleryFileType === "string"
        ? req.query.projectGalleryFileType
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    const galleries = await projectService.getProjectGalleriesByProjectId(
      projectId,
      types.length > 0 ? types : undefined,
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
    req: Request<{ projectId: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const { projectId } = req.params;
    const { type } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    // Support filtering by type
    const validTypes = ["floorplan", "unitplan", "masterplan"];
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

export const getProjectMediasByProjectId = asyncHandler(
  async (
    req: Request<{ projectId: string }, any, any, { type?: string }>,
    res: Response,
  ) => {
    const { projectId } = req.params;
    const { type } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    let mediaType: MediaType | undefined = undefined;

    if (type) {
      mediaType = type.trim().toLowerCase() as MediaType;
    }

    const medias = await projectService.getProjectMediasByProjectId(
      projectId,
      mediaType,
    );

    // Handle presigned URLs for images
    await Promise.all(
      medias.map(async (item: any) => {
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
      `Project Medias${mediaType ? ` (${mediaType})` : ""} fetched successfully`,
      medias,
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

export const getProjectReraByProjectId = asyncHandler(
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const projectReras =
      await projectService.getProjectReraByProjectId(projectId);

    await Promise.all(
      projectReras.map(async (item: any) => {
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
      "Project location advantages fetched successfully",
      projectReras,
    );
  },
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

export const getProjectContentDetailsByType = asyncHandler(
  async (
    req: Request,    res: Response,
  ) => {
    const projectId = req.params.projectId as string ;

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
  async (
    req: Request<{ projectId: string }, any, any, { towerId?: string; mediaType?: string; year?: string; month?: string }>,
    res: Response,
  ) => {
    const { projectId } = req.params;
    const { towerId, mediaType, year, month } = req.query;

    if (!projectId) {
      throw new ApiError(400, "projectId parameter is required");
    }

    const record = await projectService.getProjectConstructionUpdates(
      projectId,
      towerId,
      mediaType,
      year,
      month
    );

    // Resolve file URLs for tower cover images and gallery items
    for (const tower of record.data) {
      if (tower.files && typeof tower.files === "object") {
        for (const [key, value] of Object.entries(tower.files)) {
          if (value && typeof value === "string") {
            (tower.files as any)[key] = await getFileUrl(value);
          }
        }
      }
      for (const gallery of (tower as any).galleries || []) {
        if (gallery.files && typeof gallery.files === "object") {
          for (const [key, value] of Object.entries(gallery.files)) {
            if (typeof value === "string" && value) {
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
      record,
    );
  }
);

