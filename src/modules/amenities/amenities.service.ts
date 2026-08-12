import { prisma } from "../../config/prisma.config.js";
import { IAmenitiesDTO, IAmenitiesUpdateDTO } from "./amenities.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createAmenities(data: IAmenitiesDTO) {
  const prismaData: any = {
    title: data.title,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.amenities.create({ data: prismaData });
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
    prisma.amenities,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getAmenitiesById(id: string) {
  return prisma.amenities.findUnique({
    where: { id },
  });
}

export async function updateAmenities(id: string, data: IAmenitiesUpdateDTO) {
  const prismaData: any = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.amenities.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteAmenities(id: string) {
  return prisma.amenities.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.amenities.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
