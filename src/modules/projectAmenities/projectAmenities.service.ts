import { prisma } from "../../config/prisma.config.js";
import {
  IProjectAmenitiesCreateDTO,
  IProjectAmenitiesUpdateDTO,
} from "./projectAmenities.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { connect } from "node:http2";

export async function createProjectAmenities(data: IProjectAmenitiesCreateDTO) {
  const prismaData: any = {
    projectId: data.projectId,
    title: data.title,
    shortDescription: data.shortDescription,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };

  return prisma.projectAmenities.create({ data: prismaData });
}

export async function getAllList(
  projectId: string,
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {
    projectId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectAmenities,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getProjectAmenitiesById(id: string) {
  return prisma.projectAmenities.findUnique({
    where: { id },
  });
}

export async function updateProjectAmenities(
  id: string,
  data: IProjectAmenitiesUpdateDTO,
) {
  const prismaData: any = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.shortDescription !== undefined
      ? { shortDescription: data.shortDescription }
      : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.seq !== undefined ? { seq: data.seq } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.projectAmenities.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteProjectAmenities(id: string) {
  return prisma.projectAmenities.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectAmenities.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectAmenities.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
