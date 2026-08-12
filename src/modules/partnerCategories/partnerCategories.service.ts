import { prisma } from "../../config/prisma.config.js";
import { IPartnerCategoriesDTO, IPartnerCategoriesUpdateDTO } from "./partnerCategories.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createPartnerCategories(data: IPartnerCategoriesDTO) {
  const prismaData: any = {
    name: data.name,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.partnerCategories.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {};

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
    prisma.partnerCategories,
    {
      where,
      orderBy: {
        createdAt: "desc",
      },
    },
    { page, limit },
  );
}
export async function getPartnerCategoriesById(id: string) {
  return prisma.partnerCategories.findUnique({
    where: { id },
  });
}

export async function updatePartners(id: string, data: IPartnerCategoriesUpdateDTO) {
  const prismaData: any = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.partnerCategories.update({
    where: { id },
    data: prismaData,
  });
}

export async function deletePartnerCategories(id: string) {
  return prisma.partnerCategories.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.partnerCategories.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}


export async function updatePartnerCategoriesSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.partnerCategories.update({
    where: { id },
    data,
  });
}