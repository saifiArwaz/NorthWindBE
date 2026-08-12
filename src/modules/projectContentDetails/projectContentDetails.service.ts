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
      type: data.type as ProjectContentDetailsTypes,
      title: data.title as any,
      alt: data.alt,
      watermark: data.watermark,
      files: data.files,
      list: data.list,
      project: {
        connect: { id: data.projectId },
      },
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
      ...(data.updatedBy
        ? { updatedUser: { connect: { id: data.updatedBy } } }
        : {}),
    },
  });
}

export async function getAllList(projectId = "", type = "", page = 1, limit = 10, search = "") {
  const where: any = {};

  if (!projectId) {
    throw new ApiError(404, "Project ID is required");
  }
  where.projectId = projectId;

  if (type) {
    where.type = type;
  }

  if (search) {
    // In-memory filter fallback for JSON search on list/title could be added here if needed,
    // but we will keep it simple.
    where.OR = [
      { type: { contains: search, mode: "insensitive" } }
    ];
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
      files: data.files,
      alt: data.alt,
      list: data.list,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
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
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectContentDetails.update({
    where: { id },
    data,
  });
}
