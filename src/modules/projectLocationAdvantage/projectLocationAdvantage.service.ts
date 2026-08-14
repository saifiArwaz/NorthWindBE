import { prisma } from "../../config/prisma.config.js";
import {
  IProjectLocationAdvDTO,
  IProjectLocationAdvUpdateDTO,
} from "./projectLocationAdvantage.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createProjectLocationAdv(data: IProjectLocationAdvDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    name: data.name,
    duration: data.duration,
    durationUnit: data.durationUnit,
    createdBy: data.createdBy,
  };
  return prisma.projectLocationAdvantage.create({
    data: prismaData,
    select: {
      id: true,
      projectId: true,
      name: true,
      durationUnit: true,
      duration: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
  });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  projectId: string,
) {
  let where: any = {
    projectId,
  };

  if (search) {
    where.OR = [
      { duration: { contains: search, mode: "insensitive" } },
      { durationUnit: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectLocationAdvantage,
    {
      where,
      orderBy: { seq: "asc" },
      select: {
        id: true,
        projectId: true,
        name:true,
        durationUnit: true,
        duration: true,
        status: true,
        seq: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
      },
    },
    { page, limit },
  );
}

export async function updateProjectLocationAdv(
  id: string,
  data: IProjectLocationAdvUpdateDTO,
) {
  let prismaData: any = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.duration !== undefined && { duration: data.duration }),
    ...(data.durationUnit !== undefined && { durationUnit: data.durationUnit }),
    ...(data.updatedBy !== undefined && { updatedBy: data.updatedBy }),
  };

  return prisma.projectLocationAdvantage.update({
    where: { id },
    data: prismaData,
    select: {
      id: true,
      projectId: true,
      name: true,
      durationUnit: true,
      duration: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
  });
}

export async function getProjectLocationAdvById(id: string) {
  return prisma.projectLocationAdvantage.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      name:true,
      durationUnit: true,
      duration: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
  });
}

export async function deleteProjectLocationAdv(id: string) {
  return prisma.projectLocationAdvantage.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedBy = payload.updatedBy;
  }
  return prisma.projectLocationAdvantage.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectLocationAdvantage.update({
    where: { id },
    data: {
      status,
      updatedBy: updatedBy || null,
    },
  });
}
