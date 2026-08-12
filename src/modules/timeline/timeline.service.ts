import { prisma } from "../../config/prisma.config.js";
import { ITimelineDTO, ITimelineUpdateDTO } from "./timeline.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createTimeline(data: ITimelineDTO) {
  let prismaData: any = {
    year: data.year,
    title: data.title,
    description: data.description,
    files: data.files ? data.files : undefined,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.timeline.create({ data: prismaData });
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
    prisma.timeline,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function updateTimeline(id: string, data: ITimelineUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      year: data.year,
      title: data.title,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.timeline.update({
    where: { id },
    data: prismaData,
  });
}

export async function getTimelineById(id: string) {
  return prisma.timeline.findUnique({
    where: { id },
  });
}

export async function deleteTimelineById(id: string) {
  return prisma.timeline.delete({
    where: { id },
  });
}

export async function updateTimelineSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.timeline.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.timeline.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
