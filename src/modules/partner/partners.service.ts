import { prisma } from "../../config/prisma.config.js";
import { IPartnersDTO, IPartnersUpdateDTO } from "./partners.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createPartners(data: IPartnersDTO) {
  const prismaData: any = {
    link: data.link,
    files: data.files,
    alt: data.alt,
    title: data.title,
    watermark: data.watermark,
    status: data.status,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.partner.create({ data: prismaData });
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
        link: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.partner,
    {
      where,
      orderBy: {
        createdAt: "desc",
      },
    },
    { page, limit },
  );
}
export async function getPartnersById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
  });
}

export async function updatePartners(id: string, data: IPartnersUpdateDTO) {
  const prismaData: any = {
    ...(data.link !== undefined ? { link: data.link } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
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

  return prisma.partner.update({
    where: { id },
    data: prismaData,
  });
}

export async function deletePartners(id: string) {
  return prisma.partner.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.partner.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}


export async function updatePartnersSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.partner.update({
    where: { id },
    data,
  });
}