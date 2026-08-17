import { prisma } from "../../config/prisma.config.js";
import {
  IEventsGalleryDTO,
  IEventsGalleryUpdateDTO,
} from "./eventGalleries.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";

export async function createEventsGallery(data: IEventsGalleryDTO) {
  let prismaData: any = {
    fileType: data.fileType as FileType,
    ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.eventGalleries.create({
    data: prismaData,
    include: { category: true },
  });
}

export async function getAllList(page = 1, limit = 10, search = "", categoryId?: string) {
  const where: any = {};
  if (search) {
    where.OR = [{ alt: { contains: search, mode: "insensitive" } }];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.eventGalleries,
    {
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    },
    { page, limit },
  );
}

export async function updateEventsGallery(
  id: string,
  data: IEventsGalleryUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      fileType: data.fileType as FileType,
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.eventGalleries.update({
    where: { id },
    data: prismaData,
    include: { category: true },
  });
}

export async function getEventsGalleryById(id: string) {
  return prisma.eventGalleries.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function deleteEventsGalleryById(id: string) {
  return prisma.eventGalleries.delete({
    where: { id },
  });
}

export async function updateEventGallerySeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.eventGalleries.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.eventGalleries.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
