import { prisma } from "../../config/prisma.config.js";
import {
  IConstructionGalleryDTO,
  IConstructionGalleryUpdateDTO,
} from "./constructionGallery.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";

export async function createConstructionGallery(data: IConstructionGalleryDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    year: data.year,
    fileType: data.fileType as FileType,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.constructionGalleries.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = {
    ...(search && {
      OR: [{ alt: { contains: search, mode: "insensitive" } }],
    }),
  };
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.constructionGalleries,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateConstructionGallery(
  id: string,
  data: IConstructionGalleryUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      year: data.year,
      fileType: data.fileType as FileType,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      project: { connect: { id: data.projectId } },
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.constructionGalleries.update({
    where: { id },
    data: prismaData,
  });
}

export async function getConstructionGalleryById(id: string) {
  return prisma.constructionGalleries.findUnique({
    where: { id },
  });
}

export async function deleteConstructionGalleryById(id: string) {
  return prisma.constructionGalleries.delete({
    where: { id },
  });
}

export async function updateEventGallerySeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.constructionGalleries.update({
    where: { id },
    data,
  });
}

export async function updateEventGalleryFeature(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.constructionGalleries.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.constructionGalleries.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
