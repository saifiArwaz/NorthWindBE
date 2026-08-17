import { prisma } from "../../config/prisma.config.js";
import {
  IHomeLoanAssistanceDTO,
  IHomeLoanAssistanceUpdateDTO,
} from "./homeLoanAssistance.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createHomeLoanAssistance(data: IHomeLoanAssistanceDTO) {
  let prismaData: any = {
    title: data.title,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    status: data.status,
    createdBy: data.createdBy,
  };
  return prisma.homeLoanAssistance.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = ""
) {
  const where: any = {
    ...(search && {
      OR: [{ title: { contains: search, mode: "insensitive" } }],
    }),
  };
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.homeLoanAssistance,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getHomeLoanAssistanceById(id: string) {
  return prisma.homeLoanAssistance.findUnique({
    where: { id },
  });
}

export async function updateHomeLoanAssistance(
  id: string,
  data: IHomeLoanAssistanceUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.homeLoanAssistance.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteHomeLoanAssistanceById(id: string) {
  return prisma.homeLoanAssistance.delete({
    where: { id },
  });
}

export async function updateHomeLoanAssistanceSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.homeLoanAssistance.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.homeLoanAssistance.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
