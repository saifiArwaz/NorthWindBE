import { prisma } from "../../config/prisma.config.js";
import {
  IPageSectionCreateDTO,
  IPageSectionUpdateDTO,
} from "./pageSections.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createPageSection(data: IPageSectionCreateDTO) {
  const existingSection = await prisma.pageSections.findFirst({
    where: {
      pageSlug: data.pageSlug,
      type: data.type,
    },
  });
  if (existingSection) {
    throw new ApiError(
      400,
      "Section with this type already exists for the page.",
    );
  }

  let prismaData: any = {
    type: data.type,
    title: data.title,
    description: data.description,
    files: data.files,
    link: data.link,
    list: data.list,
    alt: data.alt,
    watermark: data.watermark,
    page: {
      connect: { slug: data.pageSlug },
    },
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };
  return prisma.pageSections.create({ data: prismaData });
}

export async function getAllList(slug = "", page = 1, limit = 10, search = "") {
  const where: any = {};

  if (!slug) {
    throw new ApiError(404, "Page slug is required");
  }
  where.pageSlug = slug;

  if (search) {
    where.OR = [
      { type: { contains: search, mode: "insensitive" } },
      { pageSlug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.pageSections,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updatePageSection(
  id: string,
  data: IPageSectionUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      list: data.list,
      link: data.link,
      status: data.status,
      type: data.type,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  // If pageSlug is provided for update, add a page connect (assumes relation is called 'page')
  if (data.pageSlug !== undefined) {
    (prismaData as any).page = { connect: { slug: data.pageSlug } };
  }

  return prisma.pageSections.update({
    where: { id },
    data: prismaData,
  });
}

export async function getPageSectionById(id: string) {
  return prisma.pageSections.findUnique({
    where: { id },
  });
}

export async function deletePageSectionById(id: string) {
  return prisma.pageSections.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.pageSections.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, seq: number, updatedBy?: string) {
  return prisma.pageSections.update({
    where: { id },
    data: {
      seq,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
