import { prisma } from "../../config/prisma.config.js";
import {
  IOfficesLocationDTO,
  IOfficesLocationUpdateDTO,
} from "./officeLocation.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";

const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createOfficesLocation(data: IOfficesLocationDTO) {
  const prismaData: any = {
    city: data.city,
    officeName: data.officeName,
    list: data.list,
    createdBy: data.createdBy,
  };

  return prisma.officesLocation.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.officesLocation,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getOfficesLocationById(id: string) {
  return prisma.officesLocation.findUnique({
    where: { id },
  });
}

export async function updateOfficesLocation(
  id: string,
  data: IOfficesLocationUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      city: data.city,
      officeName: data.officeName,
      list: data.list,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.officesLocation.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteOfficesLocation(id: string) {
  return prisma.officesLocation.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.officesLocation.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
