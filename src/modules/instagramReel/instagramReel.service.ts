import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { IInstagramReelCreateDTO } from "./instagramReel.interface.js";

export async function createInstagramReel(data: IInstagramReelCreateDTO) {
  const prismaData: any = {
    reelId: data.reelId,
    thumbnail_url: data.thumbnail_url,
    isDisplay: Boolean(data.isDisplay),
    createdBy: data.createdBy,
  };

  return prisma.instagramReel.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = {
    ...(search && {
      OR: [{ title: { contains: search, mode: "insensitive" } }],
    }),
  };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.instagramReel,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getInstagramReelById(id: string) {
  return prisma.instagramReel.findUnique({
    where: { id },
  });
}

export async function deleteInstagramReelById(id: string) {
  return prisma.instagramReel.delete({
    where: { id },
  });
}

export async function updateInstagramReelSeq(id: string, payload: any) {
  const data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }

  return prisma.instagramReel.update({
    where: { id },
    data,
  });
}

export async function chooseInstagramReel(
  id: string,
  isDisplay: boolean,
  updatedBy: string | undefined,
) {
  return prisma.instagramReel.update({
    where: { id },
    data: {
      isDisplay,
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
  return prisma.instagramReel.update({
    where: { id },
    data: {
      isDisplay: status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
