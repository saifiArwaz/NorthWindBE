import { prisma } from "../../config/prisma.config.js";
import { IProjectTowerDTO, IProjectTowerUpdateDTO } from "./projectTower.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { ApiError } from "../../utils/apiError.utils.js";

export async function createProjectTower(data: IProjectTowerDTO) {
  let slug = data.slug;
  if (!slug && data.name) {
    slug = slugify(data.name, { lower: true, strict: true });
  }

  const existing = await prisma.projectTower.findUnique({ where: { slug: slug! } });
  if (existing) throw new ApiError(400, "Slug already exists");

  const prismaData = Object.fromEntries(
    Object.entries({
      ...(data.projectId ? { project: { connect: { id: data.projectId } } } : {}),
      name: data.name,
      slug: slug,
      title: data.title,
      description: data.description,
      link: data.link,
      list: data.list,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
      ...(data.updatedBy ? { updatedUser: { connect: { id: data.updatedBy } } } : {}),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.projectTower.create({
    data: prismaData as any,
  });
}

export async function getAllList(page = 1, limit = 10, search = "", projectId?: string) {
  let where: any = { isDeleted: false };
  if (projectId) where.projectId = projectId;
  return paginate(prisma.projectTower, { where, orderBy: { seq: "asc" } }, { page, limit });
}

export async function getProjectTowerById(id: string) {
  return prisma.projectTower.findUnique({ where: { id } });
}

export async function updateProjectTower(id: string, data: IProjectTowerUpdateDTO) {

  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      slug: data.slug,
      title: data.title,
      description: data.description,
      link: data.link,
      list: data.list,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy ? { updatedUser: { connect: { id: data.updatedBy } } } : {}),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.projectTower.update({ where: { id }, data: prismaData as any });
}

export async function deleteProjectTower(id: string) {
  return prisma.projectTower.delete({ where: { id } });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { seq: payload.seq };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
  }
  return prisma.projectTower.update({ where: { id }, data });
}

export async function updateStatus(id: string, status: boolean, updatedBy?: string) {
  let data: any = { status };
  if (updatedBy) {
    data.updatedUser = { connect: { id: updatedBy } };
  }
  return prisma.projectTower.update({
    where: { id },
    data,
  });
}

export async function findFirst(id: string, slug: string) {
  return prisma.projectTower.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
}
