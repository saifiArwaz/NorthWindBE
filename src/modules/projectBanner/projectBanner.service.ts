import { prisma } from "../../config/prisma.config.js";
import {
  IProjectBannerCreateDTO,
  IProjectBannerUpdateDTO,
} from "./projectBanner.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createProjectBanner(data: IProjectBannerCreateDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };
  return prisma.projectBanner.create({ data: prismaData });
}

export async function getAllList(
  projectId: string,
  page = 1,
  limit = 10,
  search = "",
) {
  const where = {
    projectId,
    ...(search && {
      OR: [{ pageName: { contains: search, mode: "insensitive" } }],
    }),
  };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectBanner,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectBanner(
  id: string,
  data: IProjectBannerUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.projectBanner.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectBannerById(id: string) {
  return prisma.projectBanner.findUnique({
    where: { id },
  });
}

export async function deleteProjectBannerById(id: string) {
  return prisma.projectBanner.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectBanner.update({
    where: { id },
    data,
  });
}

export async function chooseProjectBanner(
  id: string,
  banner: boolean,
  updatedBy: string | undefined,
) {
  return prisma.projectBanner.update({
    where: { id },
    data: {
      isBanner: banner,
      ...(updatedBy && {
        updatedUser: {
          connect: { id: updatedBy },
        },
      }),
    },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectBanner.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
