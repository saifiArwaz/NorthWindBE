import { prisma } from "../../config/prisma.config.js";
import {
  IProjectReraDTO,
  IProjectReraUpdateDTO,
} from "./projectRera.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createProjectRera(data: IProjectReraDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    phase: data.phase,
    reraNumber: data.reraNumber,
    createdBy: data.createdBy,
  };
  return prisma.projectRera.create({ data: prismaData });
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
      { phase: { contains: search, mode: "insensitive" } },
      { reraNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectRera,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectRera(
  id: string,
  data: IProjectReraUpdateDTO,
) {
  let prismaData: any = {
    ...(data.files && { files: data.files }),
    ...(data.alt && { alt: data.alt }),
    ...(data.phase && { phase: data.phase }),
    ...(data.reraNumber && { reraNumber: data.reraNumber }),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.projectRera.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectReraById(id: string) {
  return prisma.projectRera.findUnique({
    where: { id },
  });
}

export async function deleteProjectRera(id: string) {
  return prisma.projectRera.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectRera.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectRera.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
