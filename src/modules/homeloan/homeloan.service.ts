import { prisma } from "../../config/prisma.config.js";
import { IHomeLoanDTO, IHomeLoanUpdateDTO } from "./homeloan.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createHomeLoan(data: IHomeLoanDTO) {
  const prismaData: any = {
    link: data.link,
    files: data.files,
    alt: data.alt,
    name: data.name,
    watermark: data.watermark,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.homeLoan.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  type: string,
) {
  const where: any = {
    isDeleted: false,
    type,
  };

  if (search) {
    where.OR = [
      {
        link: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.homeLoan,
    {
      where,
      orderBy: {
        createdAt: "desc",
      },
    },
    { page, limit },
  );
}
export async function getHomeLoanById(id: string) {
  return prisma.homeLoan.findUnique({
    where: { id },
  });
}

export async function updateHomeLoan(id: string, data: IHomeLoanUpdateDTO) {
  const prismaData: any = {
    ...(data.link !== undefined ? { link: data.link } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.files !== undefined ? { files: data.files } : {}),
    ...(data.alt !== undefined ? { alt: data.alt } : {}),
    ...(data.watermark !== undefined ? { watermark: data.watermark } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.homeLoan.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteHomeLoan(id: string) {
  return prisma.homeLoan.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.homeLoan.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}


export async function updateHomeLoanSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.homeLoan.update({
    where: { id },
    data,
  });
}