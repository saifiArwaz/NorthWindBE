import { prisma } from "../../config/prisma.config.js";
import {
  IEventCategoryDTO,
  IEventCategoryUpdateDTO,
} from "./eventCategory.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createEventCategory(data: IEventCategoryDTO) {
  return prisma.eventCategory.create({
    data: {
      name: data.name,
      status: data.status,
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
    },
  });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = { isDeleted: false };
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.eventCategory,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getEventCategoryById(id: string) {
  return prisma.eventCategory.findUnique({
    where: { id },
  });
}

export async function updateEventCategory(
  id: string,
  data: IEventCategoryUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.eventCategory.update({
    where: { id },
    data: prismaData,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.eventCategory.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.eventCategory.update({
    where: { id },
    data,
  });
}

export async function deleteEventCategory(id: string) {
  return prisma.eventCategory.delete({
    where: { id },
  });
}
