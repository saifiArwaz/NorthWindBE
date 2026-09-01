import { prisma } from "../../config/prisma.config.js";
import {
  IEventsGalleryDTO,
  IEventsGalleryUpdateDTO,
} from "./eventGalleries.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { ApiError } from "../../utils/apiError.utils.js";

export async function createEventsGallery(data: IEventsGalleryDTO) {
  let prismaData: any = {
    title: data.title,
    fileType: data.fileType as FileType,
    ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
    ...(data.eventId && { event: { connect: { id: data.eventId } } }),
    files: data.files,
    link: data.link,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy && {
      creator: { connect: { id: data.createdBy } },
    }),
  };
  return prisma.eventGalleries.create({
    data: prismaData,
    include: { category: true },
  });
}

export async function getAllList(page = 1, limit = 10, search = "", categoryId?: string, eventId?: string) {
  const where: any = {};
  if (search) {
    where.OR = [{ alt: { contains: search, mode: "insensitive" } }];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (eventId) {
    where.eventId = eventId;
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  const paginatedResult = await paginate(
    prisma.eventGalleries,
    {
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { include: { event: { select: { id: true, title: true} } } } },
    },
    { page, limit },
  ) as any;

  return paginatedResult;
}

export async function updateEventsGallery(
  id: string,
  data: IEventsGalleryUpdateDTO,
) {

  const prismaData: any = Object.fromEntries(
    Object.entries({
      title: data.title,
      fileType: data.fileType as FileType,
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
      ...(data.eventId && { event: { connect: { id: data.eventId } } }),
      files: data.files,
      link: data.link,
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
    include: { category: { include: { event: { select: { id: true, title: true } } } } },
  });
}

export async function getEventsGalleryById(id: string) {
  const record = await prisma.eventGalleries.findUnique({
    where: { id, isDeleted: false },
    include: { 
      category: { include: { event: { select: { id: true, title: true} } } }, 
    },
  });

  return record;
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

export async function updateFeature(
  id: string,
  isFeature: boolean,
  updatedBy?: string,
) {
  return prisma.eventGalleries.update({
    where: { id },
    data: {
      isFeature,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
