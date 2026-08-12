import { prisma } from "../../config/prisma.config.js";
import { IBrandsDTO, IBrandsUpdateDTO } from "./brands.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createBrands(data: IBrandsDTO) {
  const prismaData: any = {
    files: data.files,
    alt: data.alt,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.brands.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ link: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.brands,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getBrandsById(id: string) {
  return prisma.brands.findUnique({
    where: { id },
  });
}

export async function updateBrands(id: string, data: IBrandsUpdateDTO) {
  const prismaData: any = {
    ...(data.link !== undefined ? { link: data.link } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.brands.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteBrands(id: string) {
  return prisma.brands.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.brands.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
