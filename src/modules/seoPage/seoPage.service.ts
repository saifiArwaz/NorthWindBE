import { prisma } from "../../config/prisma.config.js";
import { ISeoPageDTO, ISeoPageUpdateDTO } from "./seoPage.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createSeoPage(data: ISeoPageDTO) {
  return prisma.seoPage.create({
    data: {
      footerLinkId: data.footerLinkId,
      seoTags: data.seoTags,
      list: data.list,
    } as any,
  });
}

export async function getAllSeoPages(
  page = 1,
  limit = 10,
  search = "",
  footerId: string,
) {
  const where: any = search
    ? {
        OR: [{ slug: { contains: search, mode: "insensitive" } }],
      }
    : {};

  (where as any).footerLinkId = footerId;
  (where as any).isDeleted = false;

  return paginate(
    prisma.seoPage,
    {
      where,
      orderBy: { createdAt: "desc" },
      include: {
        footerLink: {
          select: {
            id: true,
            label: true,
            slug: true,
          },
        },
      },
    },
    { page, limit },
  );
}

export async function getSeoPageById(id: string) {
  return prisma.seoPage.findUnique({
    where: { id },
  });
}

export async function updateSeoPage(id: string, data: ISeoPageUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      list: data.list,
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.seoPage.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteSeoPage(id: string) {
  return prisma.seoPage.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.seoPage.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
