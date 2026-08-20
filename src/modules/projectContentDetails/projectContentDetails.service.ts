import { prisma } from "../../config/prisma.config.js";
import {
  IProjectContentDetailsCreateDTO,
  IProjectContentDetailsUpdateDTO,
} from "./projectContentDetails.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ProjectContentDetailsTypes } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createProjectContentDetails(data: IProjectContentDetailsCreateDTO) {
  return prisma.projectContentDetails.create({
    data: {
      title: data.title,
      description: data.description,
      alt: data.alt,
      watermark: data.watermark,
      files: data.files,
      projectId: data.projectId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    },
  });
}

export async function getAllList(projectId = "", page = 1, limit = 10, search = "") {
  const where: any = {};

  if (!projectId) {
    throw new ApiError(404, "Project ID is required");
  }
  where.projectId = projectId;

  if (search) {
    // In-memory filter fallback for JSON search on list/title could be added here if needed,
    // but we will keep it simple.
  }

  where.isDeleted = false;

  return paginate(
    prisma.projectContentDetails,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateProjectContentDetails(
  id: string,
  data: IProjectContentDetailsUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.projectContentDetails.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectContentDetailsById(id: string) {
  return prisma.projectContentDetails.findUnique({
    where: { id },
  });
}

export async function deleteProjectContentDetailsById(id: string) {
  return prisma.projectContentDetails.update({
    where: { id },
    data: { isDeleted: true },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectContentDetails.update({
    where: { id },
    data: {
      status,
      updatedBy: updatedBy || null,
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedBy = payload.updatedBy;
  }
  return prisma.projectContentDetails.update({
    where: { id },
    data,
  });
}
