import { prisma } from "../../config/prisma.config.js";
import {
  IContentByTypeCreateDTO,
  IContentByTypeUpdateDTO,
} from "./contentByType.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createContentByType(data: IContentByTypeCreateDTO) {
  let prismaData: any = {
    type: data.type,
    title: data.title,
    alt: data.alt,
    description: data.description,
    files: data.files,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };
  return prisma.contentByTypes.create({ data: prismaData });
}

export async function getAllList(type = "", page = 1, limit = 10, search = "") {
  const where: any = {};

  if (!type) {
    throw new ApiError(404, "Type is required");
  }
  where.type = type;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subHeading: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.contentByTypes,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateContentByType(
  id: string,
  data: IContentByTypeUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      description: data.description,
      files: data.files,
      alt: data.alt,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  // If pageSlug is provided for update, add a page connect (assumes relation is called 'page')
  if (data.pageSlug !== undefined) {
    (prismaData as any).page = { connect: { slug: data.pageSlug } };
  }

  return prisma.contentByTypes.update({
    where: { id },
    data: prismaData,
  });
}

export async function getContentByTypeById(id: string) {
  return prisma.contentByTypes.findUnique({
    where: { id },
  });
}

export async function deleteContentByTypeById(id: string) {
  return prisma.contentByTypes.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.contentByTypes.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateContentSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.contentByTypes.update({
    where: { id },
    data,
  });
}
