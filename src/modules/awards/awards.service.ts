import { prisma } from "../../config/prisma.config.js";
import { IAwardDTO, IAwardUpdateDTO } from "./awards.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createAward(data: IAwardDTO) {
  const prismaData: any = {
    title: data.title,
    publication: data.publication,
    description: data.description,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.awards.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { publication: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.awards,
    {
      where,
      orderBy: [{ seq:"asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getAwardById(id: string) {
  return prisma.awards.findUnique({
    where: { id },
  });
}

export async function updateAward(id: string, data: IAwardUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      publication: data.publication,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.awards.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteAward(id: string) {
  return prisma.awards.delete({
    where: { id },
  });
}

export async function updateAwardSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.awards.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.awards.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateIsHome(
  id: string,
  isHome: boolean,
  updatedBy?: string,
) {
  return prisma.awards.update({
    where: { id },
    data: {
      isHome: Boolean(isHome),
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}


