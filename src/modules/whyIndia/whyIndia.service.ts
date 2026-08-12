import { prisma } from "../../config/prisma.config.js";
import { IWhyIndiaDTO, IWhyIndiaUpdateDTO } from "./whyIndia.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createWhyIndia(data: IWhyIndiaDTO) {
  const prismaData: any = {
    title: data.title,
    shortDescription: data.shortDescription,
    tags: data.tags,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.nriWhy.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.nriWhy,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getWhyIndiaById(id: string) {
  return prisma.nriWhy.findUnique({
    where: { id },
  });
}

export async function updateWhyIndia(id: string, data: IWhyIndiaUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      shortDescription: data.shortDescription,
      tags: data.tags,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.nriWhy.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteWhyIndia(id: string) {
  return prisma.nriWhy.delete({
    where: { id },
  });
}

export async function updateWhyIndiaSeq(id: string, payload: any) {
  const data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.nriWhy.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.nriWhy.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
