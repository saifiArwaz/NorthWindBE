import { prisma } from "../../config/prisma.config.js";
import {
  ISubTypologyDTO,
  ISubTypologyUpdateDTO,
} from "./SubTypology.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createSubTypology(data: ISubTypologyDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.subTypology.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.subTypology.create({ data: prismaData });
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
    prisma.subTypology,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateSubTypology(
  id: string,
  data: ISubTypologyUpdateDTO,
) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.subTypology.findFirst({
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

  return prisma.subTypology.update({
    where: { id },
    data: prismaData,
  });
}

export async function getSubTypologyById(id: string) {
  return prisma.subTypology.findUnique({
    where: { id },
  });
}

export async function deleteSubTypology(id: string) {
  return prisma.subTypology.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.subTypology.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
