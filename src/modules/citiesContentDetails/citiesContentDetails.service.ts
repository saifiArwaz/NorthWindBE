import { prisma } from "../../config/prisma.config.js";
import {
  ICitiesContentDetailDTO,
  ICitiesContentDetailUpdateDTO,
} from "./citiesContentDetails.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { CityContentDetailTypes } from "../../generated/prisma/enums.js";

export async function createCitiesContentDetail(data: ICitiesContentDetailDTO) {
  const prismaData: any = {
    type: data.type as CityContentDetailTypes,
    heading: data.heading,
    shortDescription: data.shortDescription,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.cityEcosystemLifestyle.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  type: string,
) {
  const where = search
    ? {
        OR: [{ heading: { contains: search, mode: "insensitive" } }],
        type: type as CityContentDetailTypes,
      }
    : {
        type: type as CityContentDetailTypes,
      };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.cityEcosystemLifestyle,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getpagePtherDetailById(id: string) {
  return prisma.cityEcosystemLifestyle.findUnique({
    where: { id },
  });
}

export async function updateCitiesContentDetail(
  id: string,
  data: ICitiesContentDetailUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      type: data.type as CityContentDetailTypes,
      heading: data.heading,
      shortDescription: data.shortDescription,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.cityEcosystemLifestyle.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteCitiesContentDetail(id: string) {
  return prisma.cityEcosystemLifestyle.delete({
    where: { id },
  });
}

export async function updateCitiesContentDetailSeq(id: string, payload: any) {
  const data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.cityEcosystemLifestyle.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.cityEcosystemLifestyle.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
