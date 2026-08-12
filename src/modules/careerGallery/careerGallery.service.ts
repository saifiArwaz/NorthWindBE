import { prisma } from "../../config/prisma.config.js";
import {
  ICareerGalleryCreateDTO,
  ICareerGalleryUpdateDTO,
} from "./careerGallery.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createCareerGallery(data: ICareerGalleryCreateDTO) {
  let prismaData: any = {
    files: data.files,
    alt: data.alt,
    createdBy: data.createdBy,
  };
  return prisma.careerGallery.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = {
    ...(search && {
      OR: [{ alt: { contains: search, mode: "insensitive" } }],
    }),
  };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.careerGallery,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateCareerGallery(
  id: string,
  data: ICareerGalleryUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      files: data.files,
      alt: data.alt,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.careerGallery.update({
    where: { id },
    data: prismaData,
  });
}

export async function getCareerGalleryById(id: string) {
  return prisma.careerGallery.findUnique({
    where: { id },
  });
}

export async function deleteCareerGalleryById(id: string) {
  return prisma.careerGallery.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.careerGallery.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.careerGallery.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
