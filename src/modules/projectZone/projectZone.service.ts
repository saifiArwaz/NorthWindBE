import { prisma } from "../../config/prisma.config.js";
import {
  IProjectZoneCreateDTO,
  IProjectZoneUpdateDTO,
} from "./projectZone.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createProjectZone(data: IProjectZoneCreateDTO) {
  const prismaData: any = {
    projectId: data.projectId,
    name: data.name,
    title: data.title,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    list: data.list,
    createdBy: data.createdBy,
  };

  return prisma.projectZone.create({ data: prismaData });
}

export async function getAllList(
  projectId?: string,
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {
    isDeleted: false,
    ...(projectId ? { projectId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return paginate(
    prisma.projectZone,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            slug: true,
          },
        },
      },
    },
    { page, limit },
  );
}

export async function getProjectZoneById(id: string) {
  return prisma.projectZone.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
          slug: true,
        },
      },
    },
  });
}

export async function updateProjectZone(
  id: string,
  data: IProjectZoneUpdateDTO,
) {
  const prismaData: any = {
    ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.list !== undefined ? { list: data.list } : {}),
    ...(data.updatedBy ? { updatedBy: data.updatedBy } : {}),
  };

  return prisma.projectZone.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteProjectZone(id: string) {
  return prisma.projectZone.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  return prisma.projectZone.update({
    where: { id },
    data: payload,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectZone.update({
    where: { id },
    data: {
      status,
      ...(updatedBy ? { updatedBy } : {}),
    },
  });
}
