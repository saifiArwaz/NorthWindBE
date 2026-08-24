import { prisma } from "../../config/prisma.config.js";
import { IMediaKitDTO, IMediaKitUpdateDTO } from "./mediaKit.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createMediaKit(data: IMediaKitDTO) {
  let prismaData: any = {
    logo: data.logo,
    alt: data.alt,
    type: data.type,
    watermark: data.watermark,
    title: data.title,
    link: data.link,
    listKit: data.listKit,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.mediaKit.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "", type?: string) {
  const where: any = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }
    : {};
  
  if (type) {
    where.type = type;
  }
  
  if (typeof where !== "undefined" && where && typeof where === "object") {
    where.isDeleted = false;
  }
  return paginate(
    prisma.mediaKit,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateMediaKit(id: string, data: IMediaKitUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      logo: data.logo,
      alt: data.alt,
      type: data.type,
      title: data.title,
      watermark: data.watermark,
      listKit: data.listKit,
      link: data.link,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.mediaKit.update({
    where: { id },
    data: prismaData,
  });
}

export async function getMediaKitById(id: string) {
  return prisma.mediaKit.findUnique({
    where: { id },
  });
}

export async function deleteMediaKitById(id: string) {
  return prisma.mediaKit.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.mediaKit.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.mediaKit.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
