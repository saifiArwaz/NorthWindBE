import { prisma } from "../../config/prisma.config.js";
import {
  IProjectMediaDTO,
  IProjectMediaUpdateDTO,
} from "./projectMedia.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { MediaType } from "../../generated/prisma/enums.js";

export async function createProjectMedia(data: IProjectMediaDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    mediaType: data.mediaType,
    fileType: data.fileType,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    link: data.link,
    createdBy: data.createdBy,
  };
  return prisma.projectMedia.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  projectId: string,
  type: string,
) {
  let where: any = {
    projectId,
  };
  if (type) {
    where.mediaType = type as MediaType;
  }

  return paginate(
    prisma.projectMedia,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getListByMediaType(
  page = 1,
  limit = 10,
  projectId: string,
  mediaType: MediaType,
) {
  return paginate(
    prisma.projectMedia,
    {
      where: { projectId, mediaType },
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectMedia(
  id: string,
  data: IProjectMediaUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      mediaType: data.mediaType,
      fileType: data.fileType,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      link: data.link,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );
  return prisma.projectMedia.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectMediaById(id: string) {
  return prisma.projectMedia.findUnique({
    where: { id },
  });
}

export async function deleteProjectMedia(id: string) {
  return prisma.projectMedia.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectMedia.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectMedia.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
