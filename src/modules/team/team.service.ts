import { prisma } from "../../config/prisma.config.js";
import { ITeamDTO, ITeamUpdateDTO } from "./team.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createTeamSection(data: ITeamDTO) {
  let prismaData: any = {
    name: data.name,
    designation: data.designation,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    description: data.description,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.team.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ pageName: { contains: search, mode: "insensitive" } }],
      }
    : {};
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.team,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateTeamSection(id: string, data: ITeamUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      designation: data.designation,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.team.update({
    where: { id },
    data: prismaData,
  });
}

export async function getTeamSectionById(id: string) {
  return prisma.team.findUnique({
    where: { id },
  });
}

export async function deleteTeamSectionById(id: string) {
  return prisma.team.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.team.update({
    where: { id },
    data,
  });
}

export async function updateTeamFounder(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.team.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.team.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
