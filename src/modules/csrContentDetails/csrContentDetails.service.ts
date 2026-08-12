import { prisma } from "../../config/prisma.config.js";
import {
  IcsrContentDetailDTO,
  IcsrContentDetailUpdateDTO,
} from "./csrContentDetails.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { csrContentTypes } from "../../generated/prisma/enums.js";

export async function createCsrContentDetail(data: IcsrContentDetailDTO) {
  const prismaData: any = {
    title: data.title,
    shortDescription: data.shortDescription,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.csrContentDetails.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
) {
  const where = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.csrContentDetails,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getCsrContentDetailById(id: string) {
  return prisma.csrContentDetails.findUnique({
    where: { id },
  });
}

export async function updateCsrContentDetail(
  id: string,
  data: IcsrContentDetailUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      shortDescription: data.shortDescription,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.csrContentDetails.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteCsrContentDetail(id: string) {
  return prisma.csrContentDetails.delete({
    where: { id },
  });
}

export async function updateCsrContentDetailSeq(id: string, payload: any) {
  const data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.csrContentDetails.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.csrContentDetails.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
