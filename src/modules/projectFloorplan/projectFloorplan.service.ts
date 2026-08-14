import { prisma } from "../../config/prisma.config.js";
import {
  IProjectFloorplanDTO,
  IProjectFloorplanUpdateDTO,
} from "./projectFloorplan.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ProjectFloorPlanTypes } from "../../generated/prisma/enums.js";

export async function createProjectFloorplan(data: IProjectFloorplanDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    towerId: data.towerId,
    title: data.title,
    list: data.list,
    type: data.type as ProjectFloorPlanTypes,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.projectFloorPlan.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  projectId: string,
  type: string,
  towerId?: string
) {
  let where: any = {
    projectId,
  };
  if (type) {
    where.type = type as ProjectFloorPlanTypes;
  }
  if (towerId) {
    where.towerId = towerId;
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectFloorPlan,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectFloorplan(
  id: string,
  data: IProjectFloorplanUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      projectId: data.projectId,
      towerId: data.towerId,
      title: data.title,
      type: data.type,
      list: data.list,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );
  return prisma.projectFloorPlan.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectFloorplanById(id: string) {
  return prisma.projectFloorPlan.findUnique({
    where: { id },
  });
}

export async function deleteProjectFloorplan(id: string) {
  return prisma.projectFloorPlan.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedBy = payload.updatedBy;
  }
  return prisma.projectFloorPlan.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectFloorPlan.update({
    where: { id },
    data: {
      status,
      updatedBy: updatedBy || null,
    },
  });
}
