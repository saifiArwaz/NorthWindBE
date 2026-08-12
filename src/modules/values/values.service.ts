import { prisma } from "../../config/prisma.config.js";
import { IValuesDTO, IValuesUpdateDTO } from "./values.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createValues(data: IValuesDTO) {
  const prismaData: any = {
    key: data.key,
    title: data.title,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    shortDescription: data.shortDescription,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.values.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.values,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getValuesById(id: string) {
  return prisma.values.findUnique({
    where: { id },
  });
}

export async function updateValues(id: string, data: IValuesUpdateDTO) {
  const prismaData: any = {
    ...(data.key !== undefined ? { key: data.key } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.shortDescription !== undefined
      ? { shortDescription: data.shortDescription }
      : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.values.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteValues(id: string) {
  return prisma.values.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.values.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
