import { prisma } from "../../config/prisma.config.js";
import { ICitiesDTO, ICitiesUpdateDTO } from "./cities.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createCity(data: ICitiesDTO) {
  console.log(data)
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.city.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    seoTags: data.seoTags,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.city.create({ data: prismaData });
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
    prisma.city,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function updateCity(id: string, data: ICitiesUpdateDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.city.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    throw new ApiError(400, "city Already exists");
  }
  let prismaData: any = {
    name: data.name,
    slug: slug,
    seoTags: data.seoTags,
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.city.update({
    where: { id },
    data: prismaData,
  });
}

export async function getCityById(id: string) {
  return prisma.city.findUnique({
    where: { id },
  });
}

export async function deleteCityById(id: string) {
  return prisma.city.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.city.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, seq: number, updatedBy?: string) {
  let data: any = { seq };
  if (updatedBy) {
    data.updatedUser = { connect: { id: updatedBy } };
  }
  return prisma.city.update({
    where: { id },
    data,
  });
}
