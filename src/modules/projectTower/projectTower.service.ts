import { prisma } from "../../config/prisma.config.js";
import { IProjectTowerDTO, IProjectTowerUpdateDTO } from "./projectTower.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createProjectTower(data: IProjectTowerDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      link: data.link,
      list: data.list,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      createdBy: data.createdBy,
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
      title: data.title,
      description: data.description,
      link: data.link,
      list: data.list,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      updatedBy: data.updatedBy,
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
    data.updatedBy = payload.updatedBy;
  }
  return prisma.projectTower.update({ where: { id }, data });
}

export async function updateStatus(id: string, status: boolean, updatedBy?: string) {
  return prisma.projectTower.update({
    where: { id },
    data: { status, updatedBy: updatedBy || null },
  });
}
