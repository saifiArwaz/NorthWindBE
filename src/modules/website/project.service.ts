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
  isHome?:boolean;
  subTypologyIds?: string;
  projectStatusIds?: string;
  isPage?: boolean;
  isFeature?: boolean;
  page?: number;
  limit?: number;
}

export async function getProjects(params: ProjectFilterParams = {}) {
  const {
    search,
    platterIds,
    cityIds,
    isHome,
    projectStatusIds,
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
 if (isHome !== undefined) {
    where.isHome = Boolean(isHome);
  }
  if (cityIds) {
    where.city = { slug: cityIds };
  }
  if (projectStatusIds) {
    where.projectStatus = { slug: projectStatusIds };
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
        cityId: true,
        platterId: true,
        typologyId: true,
        projectStatusId: true,
        location: true,
        files: true,
        alt: true,
        watermark: true,
        brochure: true,
        seoTags: true,
        otherDetails: true,
        isPage: true,
        isFeature: true,
        isHome:true,
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
  return project;
}

export async function getProjectGalleriesByProjectId(
  projectId: string,
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
  towerId?: string,
) {
  return prisma.projectFloorPlan.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
      ...(type ? { type: type as any } : {}),
      ...(towerId ? { towerId } : {}),
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      type: true,
      towerId: true,
      tower: {
        select: {
          id: true,
          name: true,
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
      name:true,
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
) {
  return prisma.projectContentDetails.findMany({
    where: {
      OR: [{ projectId: projectId }, { project: { slug: projectId } }],
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      projectId: true,
      title: true,
      description: true,
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
  year?: number,
  month?: number
) {
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
    select: { id: true, projectName: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const projectData = {
    id: project.id,
    name: project.projectName,
  };

  if (towerId) {
    const tower = await prisma.projectTower.findFirst({
      where: {
        id: towerId,
        projectId,
        status: true,
        isDeleted: false,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
      },
    });

    if (!tower) {
      throw new Error("Tower not found or does not belong to this project");
    }

    let dateFilter: any = undefined;

    if (year) {
      if (month) {
        // Use UTC dates to avoid any timezone shifts
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        dateFilter = { gte: startDate, lte: endDate };
      } else {
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
        dateFilter = { gte: startDate, lte: endDate };
      }
    }

    let galleries = await prisma.constructionGalleries.findMany({
      where: {
        projectId,
        towerId,
        status: true,
        isDeleted: false,
        ...(dateFilter ? { dateAt: dateFilter } : {}),
      },
      select: {
        id: true,
        title: true,
        files: true,
        alt: true,
        watermark: true,
        seq: true,
        dateAt: true,
      },
      orderBy: { seq: "asc" },
    });

    if (!year && month) {
      galleries = galleries.filter(g => {
        if (!g.dateAt) return false;
        return new Date(g.dateAt).getUTCMonth() + 1 === month;
      });
    }

    return {
      project: projectData,
      tower,
      galleries,
    };
  }

  const towers = await prisma.projectTower.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      title: true,
      files: true,
      list: true,
    },
    orderBy: {
      seq: "asc",
    },
  });

  return {
    project: projectData,
    towers,
  };
}

export async function getProjectTowersByProjectId(projectId: string) {
  return prisma.projectTower.findMany({
    where: {
      projectId,
      isDeleted: false,
      status: true,
    },
    orderBy: { seq: "asc" },
  });
}
