import { prisma } from "../../config/prisma.config.js";
import { ITypologyDTO, ITypologyUpdateDTO } from "./typology.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createTypology(data: ITypologyDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.typology.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.typology.create({ data: prismaData });
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
    prisma.typology,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateTypology(id: string, data: ITypologyUpdateDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.typology.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.typology.update({
    where: { id },
    data: prismaData,
  });
}

export async function getTypologyById(id: string) {
  return prisma.typology.findUnique({
    where: { id },
  });
}

export async function deleteTypology(id: string) {
  return prisma.typology.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.typology.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
