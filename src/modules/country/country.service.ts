import { prisma } from "../../config/prisma.config.js";
import { ICountryDTO, ICountryUpdateDTO } from "./country.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createCountry(data: ICountryDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.country.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.country.create({ data: prismaData });
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
    prisma.country,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateCountry(id: string, data: ICountryUpdateDTO) {
  const slug = slugify(data.name, { lower: true });
  // Check for existing city with the same slug, but not with the same id
  const existing = await prisma.country.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    throw new ApiError(400, "city Already exists");
  }
  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.country.update({
    where: { id },
    data: prismaData,
  });
}

export async function getCountryById(id: string) {
  return prisma.country.findUnique({
    where: { id },
  });
}

export async function deleteCountryById(id: string) {
  return prisma.country.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.country.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
