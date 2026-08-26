import { prisma } from "../../config/prisma.config.js";
import {
  IProjectSectionCreateDTO,
  IProjectSectionUpdateDTO,
} from "./projectSections.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType, ProjectSectionTypes } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createProjectSection(data: IProjectSectionCreateDTO) {
  return prisma.projectSection.create({
    data: {
      type: data.type as ProjectSectionTypes,
      title: data.title,
      alt: data.alt,
      watermark: data.watermark,
      description: data.description,
      files: data.files,
      list: data.list,
      link: data.link,
      projects: {
        connect: { id: data.projectId },
      },
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
      ...(data.updatedBy
        ? { updatedUser: { connect: { id: data.updatedBy } } }
        : {}),
    },
  });
}

export async function getAllProjectSection(
  projectId = "",
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {
    ...(projectId ? { projectId } : {}),
  };
  if (search) {
    where.OR = [
      { pageName: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { heading: { contains: search, mode: "insensitive" } },
    ];
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectSection,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getAllProjectSectionList(
  page = 1,
  limit = 10,
  search = "",
) {
  const where = search
    ? {
        OR: [
          { pageName: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { heading: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  return paginate(
    prisma.projectSectionLists,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getProjectSectionById(id: string) {
  return prisma.projectSection.findUnique({
    where: { id },
  });
}

export async function updateProjectSection(
  id: string,
  data: IProjectSectionUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      link: data.link,
      description: data.description,
      list: data.list,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );
  const section = await prisma.projectSection.update({
    where: { id },
    data: prismaData,
  });

  return section;
}

export async function deleteProjectSection(id: string) {
  return prisma.projectSection.delete({
    where: { id },
  });
}

export async function getProjectSectionBySectionType(
  projectId: string,
  sectionType: string,
) {
  return prisma.projectSection.findFirst({
    where: {
      projectId: projectId,
      type: sectionType as ProjectSectionTypes,
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectSection.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectSection.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
