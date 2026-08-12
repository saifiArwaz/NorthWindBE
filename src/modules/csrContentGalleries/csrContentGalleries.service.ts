import { prisma } from "../../config/prisma.config.js";
import {
  IcsrContentGalleriesCreateDTO,
  IcsrContentGalleriesUpdateDTO,
} from "./csrContentGalleries.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { csrContentTypes } from "../../generated/prisma/enums.js";

export async function createCsrGalleries(data: IcsrContentGalleriesCreateDTO) {
  let prismaData: any = {
    type: data.type,
    fileType: data.fileType || "image",
    alt: data.alt,
    files: data.files,
    watermark: data.watermark,
    link: data.link,
    status: data.status !== undefined ? data.status : true,
    ...(data.createdBy
      ? { creator: { connect: { id: data.createdBy } } }
      : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };
  return prisma.csrContentGalleries.create({ data: prismaData });
}

export async function getAllcsrContentGalleries(
  page = 1,
  limit = 10,
  search = "",
  type?: string,
) {
  let where: any = { isDeleted: false };

  if (type && type.toLowerCase() !== "all") {
    where.type = type as csrContentTypes;
  }

  if (search) {
    where.OR = [{ alt: { contains: search, mode: "insensitive" } }];
  }

  return paginate(
    prisma.csrContentGalleries,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function updatecsrContentGalleries(
  id: string,
  data: IcsrContentGalleriesUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      type: data.type,
      fileType: data.fileType,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      link: data.link,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.csrContentGalleries.update({
    where: { id },
    data: prismaData,
  });
}

export async function getcsrContentGalleriesById(id: string) {
  return prisma.csrContentGalleries.findUnique({
    where: { id },
  });
}

export async function deletecsrContentGalleriesById(id: string) {
  return prisma.csrContentGalleries.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.csrContentGalleries.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.csrContentGalleries.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
