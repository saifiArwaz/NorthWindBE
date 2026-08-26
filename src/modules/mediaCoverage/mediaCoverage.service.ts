import { prisma } from "../../config/prisma.config.js";
import {
  IMediaCoverageDTO,
  IMediaCoverageUpdateDTO,
} from "./mediaCoverage.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createMediaCoverage(data: IMediaCoverageDTO) {
  let prismaData: any = {
    title: data.title,
    mediaType: data.mediaType,
    dateAt: data.dateAt,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    link: data.link,
    description: data.description,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.mediaCoverage.create({
    data: prismaData,
  });
}

export async function getAllList(page = 1, limit = 10, search = "", mediaType?: string) {
  const where: any = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }
    : {};
  
  if (mediaType) {
    where.mediaType = mediaType;
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.mediaCoverage,
    {
      where,
      orderBy: [ { seq:"asc" }, { createdAt: "desc" } ],
    },
    { page, limit },
  );
}

export async function updateMediaCoverage(
  id: string,
  data: IMediaCoverageUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      description: data.description,
      mediaType: data.mediaType,
      dateAt: data.dateAt,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      link: data.link,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.mediaCoverage.update({
    where: { id },
    data: prismaData,
  });
}

export async function getMediaCoverageById(id: string) {
  return prisma.mediaCoverage.findUnique({
    where: { id },
  });
}

export async function deleteMediaCoverageById(id: string) {
  return prisma.mediaCoverage.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.mediaCoverage.update({
    where: { id },
    data,
  });
}

export async function updateFeature(
  id: string,
  isHome: boolean,
  updatedBy: string,
) {
  return prisma.mediaCoverage.update({
    where: { id },
    data: {
      isHome: isHome,
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.mediaCoverage.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
