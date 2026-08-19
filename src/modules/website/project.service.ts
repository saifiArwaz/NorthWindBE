import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { BUDGET_RANGES } from "../../utils/budget.utils.js";
import { MediaType, ProjectContentDetailsTypes } from "../../generated/prisma/enums.js";

// INTERFACE
export interface ProjectFilterParams {
  search?: string;
  platterIds?: string;
  cityIds?: string;
  localityIds?: string;
  subTypologyIds?: string;
  projectStatusIds?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeature?: boolean;
  isLuxuryLocation?: number;
  isPage?: boolean;
  isNewLaunch?: boolean;
  page?: number;
  limit?: number;
}

export async function getProjects(params: ProjectFilterParams = {}) {
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
    isPage,
    isNewLaunch,
    page = 1,
    limit = 10,
  } = params;
  const where: any = {
    status: true,
    isDeleted: false,
  };

  if (platterIds) {
    where.platter = { slug: platterIds };
  }

  if (cityIds) {
    where.city = { slug: cityIds };
  }

  if (localityIds) {
    where.locality = { slug: localityIds };
  }

  if (subTypologyIds) {
    where.projectSubTypology = {
      some: {
        subTypology: {
          slug: subTypologyIds,
        },
      },
    };
  }

  if (projectStatusIds) {
    where.projectStatus = { slug: projectStatusIds };
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    where.price = {};
    if (typeof minPrice === "number") {
      where.price.gte = Number(minPrice);
    }
    if (typeof maxPrice === "number") {
      where.price.lte = Number(maxPrice);
    }
  }

  if (isFeature !== undefined) {
    where.isFeature = Boolean(isFeature);
  }

  if (isLuxuryLocation !== undefined) {
    where.isLuxuryLocation = Number(isLuxuryLocation);
  }

  if (isPage !== undefined) {
    where.isPage = Boolean(isPage);
  }

  if (isNewLaunch !== undefined) {
    where.isNewLaunch = Boolean(isNewLaunch);
  }

  if (search?.trim()) {
    where.OR = [
      {
        slug: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        projectName: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.projects,
    {
      where,
      orderBy: { seq: "asc" },
      select: {
        id: true,
        slug: true,
        projectName: true,
        price: true,
        cityId: true,
        platterId: true,
        typologyId: true,
        projectStatusId: true,
        location: true,
        files: true,
        alt: true,
        watermark: true,
        tags: true,
        brochure: true,
        seoTags: true,
        otherDetails: true,
        isPage: true,
        isFeature: true,
        isLuxuryLocation: true,
        status: true,
        seq: true,
        platter: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        locality: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        typology: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        projectStatus: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        projectSubTypology: {
          select: {
            id: true,
            projectId: true,
            subTypologyId: true,

            subTypology: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        projectBanner: {
          select: {
            id: true,
            projectId: true,
            alt: true,
            files: true,
            watermark: true,
            seq: true,
            status: true,
          },
        },
      },
    },
    {
      page,
      limit,
    },
  );
}

export async function getProjectBySlug(platterSlug: string, slug: string) {
  const project = await prisma.projects.findFirst({
    where: {
      slug,
      status: true,
      isDeleted: false,
      platter: {
        slug: platterSlug,
        status: true,
        isDeleted: false,
      },
    },
    include: {
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      platter: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      typology: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      projectSubTypology: {
        select: {
          id: true,
          projectId: true,
          subTypologyId: true,

          subTypology: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      projectStatus: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      projectSection: {
        orderBy: { seq: "asc" },
        where: {
          status: true,
          isDeleted: false,
        },
      },
    },
  });

  if (project?.projectSection) {
    if (project && Array.isArray(project.projectSection)) {
      const sectionObject: { [type: string]: any } = {};
      for (const section of project.projectSection) {
        if (section.type) {
          sectionObject[section.type] = section;
        }
      }
      (project as any).projectSectionByType = sectionObject;
    }
  }

  return project;
}

export async function getProjectGalleriesByProjectId(
  projectId: string,
  types?: string[],
  fileTypes?: string[],
) {
  const galleries = await prisma.projectGallery.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
      ...(fileTypes && fileTypes.length > 0
        ? { fileType: { in: fileTypes as any[] } }
        : {}),
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      fileType: true,
      files: true,
      alt: true,
      watermark: true,
      link: true,
      seq: true,
    },
  });

  return galleries;
}

export async function getProjectAmenitiesByProjectId(projectId: string) {
  return prisma.projectAmenities.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    orderBy: [{ seq: "asc" }],
    select: {
      id: true,
      projectId: true,
      title: true,
      files: true,
      alt: true,
      watermark: true,
      seq: true,
      status: true,
    },
  });
}

export async function getProjectFloorPlansByProjectId(
  projectId: string,
  type?: string,
) {
  return prisma.projectFloorPlan.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      type: true,
      towerId: true,
      tower: {
        select: {
          id: true,
          title: true,
        },
      },
      list: true,
      files: true,
      alt: true,
      watermark: true,
      seq: true,
    },
  });
}

export async function getProjectMediasByProjectId(
  projectId: string,
  type?: MediaType,
) {
  return prisma.projectMedia.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
      mediaType: type as MediaType,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      mediaType: true,
      fileType: true,
      files: true,
      alt: true,
      watermark: true,
      link: true,
      seq: true,
      status: true,
    },
  });
}

export async function getProjectLocationAdvantageByProjectId(
  projectId: string,
) {
  return prisma.projectLocationAdvantage.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      projectId: true,
      durationUnit: true,
      duration: true,
      status: true,
      seq: true,
    },
  });
}

export async function getProjectReraByProjectId(projectId: string) {
  return prisma.projectRera.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      files: true,
      alt: true,
      watermark: true,
      phase: true,
      reraNumber: true,
      status: true,
      seq: true,
    },
  });
}

export async function getProjectFaqsByProjectId(projectId: string) {
  return prisma.projectFaq.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      question: true,
      answer: true,
      seq: true,
      status: true,
    },
  });
}

export async function getProjectContentDetailsByType(
  projectId: string,
  type?: string,
) {
  return prisma.projectContentDetails.findMany({
    where: {
      OR: [{ projectId: projectId }, { project: { slug: projectId } }],
      status: true,
      isDeleted: false,
      ...(type
        ? {
            type: type.toLowerCase() as ProjectContentDetailsTypes,
          }
        : {}),
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      projectId: true,
      type: true,
      title: true,
      list: true,
      files: true,
      alt: true,
      watermark: true,
      seq: true,
      status: true,
    },
  });
}

export async function getProjectConstructionUpdates(
  projectId: string,
  towerId?: string,
  mediaType?: string,
  year?: string,
  month?: string
) {
  let dateFilter: any = undefined;

  if (year) {
    const yr = parseInt(year);
    if (!isNaN(yr)) {
      if (month) {
        const mn = parseInt(month); // 1-12
        if (!isNaN(mn)) {
          const startDate = new Date(yr, mn - 1, 1);
          const endDate = new Date(yr, mn, 0, 23, 59, 59, 999);
          dateFilter = { gte: startDate, lte: endDate };
        }
      } else {
        const startDate = new Date(yr, 0, 1);
        const endDate = new Date(yr, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: startDate, lte: endDate };
      }
    }
  }

  const towers = await prisma.projectTower.findMany({
    where: {
      projectId,
      isDeleted: false,
      status: true,
      ...(towerId ? { id: towerId } : {})
    },
    orderBy: { seq: "asc" },
    include: {
      galleries: {
        where: {
          isDeleted: false,
          status: true,
          ...(mediaType ? { fileType: mediaType as any } : {}),
          ...(dateFilter ? { dateAt: dateFilter } : {})
        },
        orderBy: { seq: "asc" },
        select: {
          id: true,
          title: true,
          dateAt: true,
          fileType: true,
          files: true,
          alt: true,
          watermark: true,
          seq: true
        }
      }
    }
  });

  const allTowers = await prisma.projectTower.findMany({
    where: {
      projectId,
      isDeleted: false,
      status: true,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: { seq: "asc" },
  });

  const metadataRecords = await prisma.constructionGalleries.findMany({
    where: {
      projectId,
      isDeleted: false,
      status: true,
    },
    select: {
      dateAt: true,
    }
  });

  const yearsSet = new Set<number>();
  const monthsSet = new Set<number>();

  for (const record of metadataRecords) {
    if (record.dateAt) {
      yearsSet.add(new Date(record.dateAt).getFullYear());
      monthsSet.add(new Date(record.dateAt).getMonth() + 1);
    }
  }

  return {
    data: towers,
    filters: {
      years: Array.from(yearsSet).sort((a, b) => b - a),
      months: Array.from(monthsSet).sort((a, b) => a - b),
      towers: allTowers,
    },
  };
}
