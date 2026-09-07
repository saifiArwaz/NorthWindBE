import { prisma } from "../../config/prisma.config.js";
import {
  ILegacyProjectCreateDTO,
  ILegacyProjectUpdateDTO,
} from "./legacyProjects.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { LegacyProjectCategory } from "../../generated/prisma/enums.js";

export async function createLegacyProject(data: ILegacyProjectCreateDTO) {
  const prismaData: any = {
    name: data.name.trim(),
    category: data.category,
    location: data.location,
    description: data.description,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };

  return prisma.legacyProject.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  category?: LegacyProjectCategory,
) {
  const where: any = {
    isDeleted: false,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return paginate(
    prisma.legacyProject,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getLegacyProjectById(id: string) {
  return prisma.legacyProject.findUnique({
    where: { id },
  });
}

export async function updateLegacyProject(
  id: string,
  data: ILegacyProjectUpdateDTO,
) {
  const prismaData: any = {
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.location !== undefined ? { location: data.location } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.updatedBy ? { updatedBy: data.updatedBy } : {}),
  };

  return prisma.legacyProject.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteLegacyProject(id: string) {
  return prisma.legacyProject.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  return prisma.legacyProject.update({
    where: { id },
    data: payload,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.legacyProject.update({
    where: { id },
    data: {
      status,
      ...(updatedBy ? { updatedBy } : {}),
    },
  });
}
