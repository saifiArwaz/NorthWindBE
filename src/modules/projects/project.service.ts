import { prisma } from "../../config/prisma.config.js";
import { IProjectsCreateDTO, IProjectsUpdateDTO } from "./project.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function getFilterList() {
  return prisma.projects.findMany({
    where: {
      isDeleted: false,
      status: true,
    },
    select: {
      id: true,
      projectName: true,
      slug: true,
    },
    orderBy: [{ seq: "asc" }, { id: "asc" }],
  });
}

export async function createProject(data: IProjectsCreateDTO) {
  const slug = slugify(data.projectName, { lower: true, strict: true });
  const existing = await prisma.projects.findUnique({ where: { slug: slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  const subTypologyList = (data.subTypologyId ?? []).filter(
    (id: string) => id && id.trim() !== "",
  );

  const prismaData: any = {
    projectName: data.projectName,
    slug: slug,
    ...(data.cityId ? { city: { connect: { id: data.cityId } } } : {}),
    platter: { connect: { id: data.platterId } },
    ...(data.typologyId && data.typologyId.trim() !== ""
      ? { typology: { connect: { id: data.typologyId } } }
      : {}),
    projectStatus: { connect: { id: data.projectStatusId } },
    files: data.files,
    brochure: data.brochure,
    alt: data.alt,
    watermark: data.watermark,
    location: data.location,
    otherDetails: data.otherDetails ?? null,
    seoTags: data.seoTags ?? null,
    type: data.type,
    shortDescription: data.shortDescription,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
    ...(subTypologyList.length > 0
      ? {
          projectSubTypology: {
            create: subTypologyList.map((id: string) => ({
              subTypologyId: id,
            })),
          },
        }
      : {}),
  };

  return prisma.projects.create({
    data: prismaData,
    include: {
      typology: true,
      city: true,
      projectStatus: true,
      platter: true,
      projectSubTypology: {
        include: { subTypology: true },
      },
    },
  });
}

export async function getAllProject(
  page = 1,
  limit = 10,
  search = "",
  platterId?: string,
  projectStatusId?: string,
  feature?: string,
) {
  const where: any = {};

  if (search) {
    where.OR = [{ projectName: { contains: search, mode: "insensitive" } }];
  }

  if (platterId) {
    where.platterId = platterId;
  }

  if (projectStatusId) {
    where.projectStatusId = projectStatusId;
  }

  if (feature === "true") {
    where.is_featured = true;
  } else if (feature === "false") {
    where.is_featured = false;
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projects,
    {
      where,
      orderBy: [{ seq: "asc" }, { id: "asc" }],
      include: {
        city: true,
        platter: true,
        typology: true,
        projectSubTypology: {
          include: { subTypology: true },
        },
      },
    },
    { page, limit },
  );
}

export async function getProjectById(id: string) {
  return prisma.projects.findUnique({
    where: { id },
    include: {
      city: true,
      platter: true,
      typology: true,
      projectSubTypology: {
        include: { subTypology: true },
      },
    },
  });
}

export async function updateProject(id: string, data: IProjectsUpdateDTO) {
  const subTypologyList = (data.subTypologyId ?? []).filter(
    (id: string) => id && id.trim() !== "",
  );

  const prismaData = Object.fromEntries(
    Object.entries({
      projectName: data.projectName,
      slug: data.slug,
      type: data.type,
      shortDescription: data.shortDescription,
      ...(data.cityId && {
        city: { connect: { id: data.cityId } },
      }),
      ...(data.platterId && {
        platter: { connect: { id: data.platterId } },
      }),

      ...(data.typologyId && data.typologyId.trim() !== ""
        ? { typology: { connect: { id: data.typologyId } } }
        : { typology: { disconnect: true } }),

      ...(data.projectStatusId && {
        projectStatus: { connect: { id: data.projectStatusId } },
      }),

      ...(data.updatedBy && {
        updatedUser: {
          connect: { id: data.updatedBy },
        },
      }),

      ...(data.subTypologyId !== undefined && {
        projectSubTypology: {
          deleteMany: {},
          ...(subTypologyList.length > 0 && {
            create: subTypologyList.map((id: string) => ({
              subTypologyId: id,
            })),
          }),
        },
      }),

      location: data.location,
      files: data.files,
      brochure: data.brochure,
      alt: data.alt,
      watermark: data.watermark,
      seoTags: data.seoTags,
      otherDetails: data.otherDetails,
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.projects.update({
    where: { id },
    data: prismaData,
    include: {
      city: true,
      platter: true,
      typology: true,
      projectSubTypology: {
        include: { subTypology: true },
      },
    },
  });
}

export async function deleteProject(id: string) {
  return prisma.projects.delete({
    where: { id },
  });
}

export async function findFirst(id: string, slug: string) {
  return prisma.projects.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projects.update({
    where: { id },
    data,
  });
}

export async function updateProjectStatus(
  id: string,
  status: boolean,
  updatedBy: string,
) {
  return prisma.projects.update({
    where: { id },
    data: {
      status: status,
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}

export async function updateProjectFeature(
  id: string,
  isFeature: boolean,
  updatedBy: string,
) {
  return prisma.projects.update({
    where: { id },
    data: {
      isFeature: isFeature,
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}

export async function updateProjectIsPage(
  id: string,
  isPage: boolean,
  updatedBy: string,
) {
  return prisma.projects.update({
    where: { id },
    data: {
      isPage: Boolean(isPage),
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}

export async function updateProjectIsHome(
  id: string,
  isHome: boolean,
  updatedBy: string,
) {
  return prisma.projects.update({
    where: { id },
    data: {
      isHome: Boolean(isHome),
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}


export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projects.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
