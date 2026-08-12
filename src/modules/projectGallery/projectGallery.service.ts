import { prisma } from "../../config/prisma.config.js";
import {
  IProjectGalleryDTO,
  IProjectGalleryUpdateDTO,
} from "./projectGallery.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { FileType, ProjectGalleryTypes } from "../../generated/prisma/enums.js";

export async function createProjectGallery(data: IProjectGalleryDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    type: data.type as ProjectGalleryTypes,
    fileType: data.fileType as FileType,
    dateAt: data.dateAt,
    files: data.files,
    link: data.link,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.projectGallery.create({ data: prismaData });
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
    where.type = type as ProjectGalleryTypes;
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectGallery,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectGallery(
  id: string,
  data: IProjectGalleryUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      type: data.type as ProjectGalleryTypes,
      fileType: data.fileType as FileType,
      dateAt: data.dateAt,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      link: data.link,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );
  return prisma.projectGallery.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectGalleryById(id: string) {
  return prisma.projectGallery.findUnique({
    where: { id },
  });
}

export async function deleteProjectGallery(id: string) {
  return prisma.projectGallery.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectGallery.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectGallery.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
