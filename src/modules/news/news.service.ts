import { prisma } from "../../config/prisma.config.js";
import { INewsDTO, INewsUpdateDTO } from "./news.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createNews(data: INewsDTO) {
  const prismaData: any = {
    title: data.title,
    logo: data.logo,
    alt: data.alt,
    watermark: data.watermark,
    newsLink: data.newsLink,
    dateAt: data.dateAt,
    createdBy: data.createdBy,
  };

  return prisma.news.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.news,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({
    where: { id },
  });
}

export async function updateNews(id: string, data: INewsUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      alt: data.alt,
      watermark: data.watermark,
      logo: data.logo,
      newsLink: data.newsLink,
      dateAt: data.dateAt,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.news.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteNews(id: string) {
  return prisma.news.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.news.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
