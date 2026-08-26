import { prisma } from "../../config/prisma.config.js";
import { IPlatterDTO, IPlatterUpdateDTO } from "./platter.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createPlatter(data: IPlatterDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.platter.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    title: data.title,
    description: data.description,
    seoTags: data.seoTags,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.platter.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }
    : {};
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.platter,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updatePlatter(id: string, data: IPlatterUpdateDTO) {
  const slug = slugify(data.name, { lower: true });

  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      slug: slug,
      title: data.title,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      seoTags: data.seoTags,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.platter.update({
    where: { id },
    data: prismaData,
  });
}

export async function getPlatterById(id: string) {
  return prisma.platter.findUnique({
    where: { id },
  });
}

export async function deletePlatterById(id: string) {
  return prisma.platter.delete({
    where: { id },
  });
}

export async function updatePlatterSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.platter.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.platter.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
