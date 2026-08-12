import { prisma } from "../../config/prisma.config.js";
import {
  IGalleriesListCreateDTO,
  IGalleriesListUpdateDTO,
} from "./galleriesList.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createGalleriesList(data: IGalleriesListCreateDTO) {
  let prismaData: any = {
    fileType: data.fileType,
    type: data.type,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.galleriesList.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  type: string,
) {
  let where: any = { type: type };

  if (search) {
    where.OR = [{ alt: { contains: search, mode: "insensitive" } }];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.galleriesList,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateGalleriesList(
  id: string,
  data: IGalleriesListUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      fileType: data.fileType,
      type: data.type,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.galleriesList.update({
    where: { id },
    data: prismaData,
  });
}

export async function getGalleriesListById(id: string) {
  return prisma.galleriesList.findUnique({
    where: { id },
  });
}

export async function deleteGalleriesListById(id: string) {
  return prisma.galleriesList.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.galleriesList.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.galleriesList.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
