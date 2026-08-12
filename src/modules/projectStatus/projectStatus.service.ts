import { prisma } from "../../config/prisma.config.js";
import {
  IProjectStatusDTO,
  IProjectStatusUpdateDTO,
} from "./projectStatus.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";

const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createProjectStatus(data: IProjectStatusDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.projectStatus.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  const prismaData: any = {
    name: data.name,
    slug,
    createdBy: data.createdBy,
  };

  return prisma.projectStatus.create({ data: prismaData });
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
    prisma.projectStatus,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getProjectStatusById(id: string) {
  return prisma.projectStatus.findUnique({
    where: { id },
  });
}

export async function updateProjectStatus(
  id: string,
  data: IProjectStatusUpdateDTO,
) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.projectStatus.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) throw new ApiError(400, "Slug already exists");

  const prismaData: any = {
    name: data.name,
    slug,
    ...(data.updatedBy
      ? {
          updatedUser: {
            connect: { id: data.updatedBy },
          },
        }
      : {}),
  };

  return prisma.projectStatus.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteProjectStatus(id: string) {
  return prisma.projectStatus.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectStatus.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
