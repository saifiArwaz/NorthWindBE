import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { IProjectMasterPlanPinDTO, IProjectMasterPlanPinUpdateDTO } from "./projectMasterPlanPin.interface.js";

export const createPin = async (data: IProjectMasterPlanPinDTO) => {
  return await prisma.projectMasterPlanPin.create({
    data: {
      projectId: data.projectId,
      categoryId: data.categoryId,
      title: data.title,
      coordinates: data.coordinates,
      createdBy: data.createdBy,
    },
  });
};

export const getAllPins = async (
  page: number,
  limit: number,
  search: string,
  projectId?: string,
  categoryId?: string
) => {
  const whereClause: any = {
    isDeleted: false,
  };

  if (projectId) whereClause.projectId = projectId;
  if (categoryId) whereClause.categoryId = categoryId;
  if (search) whereClause.title = { contains: search, mode: "insensitive" };

  return paginate(
    prisma.projectMasterPlanPin,
    {
      where: whereClause,
      orderBy: { seq: "asc" },
      include: {
        category: {
          select: { name: true }
        }
      },
    },
    { page, limit }
  );
};

export const getPinById = async (id: string) => {
  return await prisma.projectMasterPlanPin.findFirst({
    where: { id, isDeleted: false },
    include: {
      category: {
        select: { name: true }
      }
    }
  });
};

export const updatePin = async (
  id: string,
  data: IProjectMasterPlanPinUpdateDTO
) => {
  return await prisma.projectMasterPlanPin.update({
    where: { id },
    data,
  });
};

export const deletePin = async (id: string) => {
  return await prisma.projectMasterPlanPin.delete({
    where: { id },
  });
};

export const updateSeq = async (id: string, data: any) => {
  return await prisma.projectMasterPlanPin.update({
    where: { id },
    data: { seq: data.seq, updatedBy: data.updatedBy },
  });
};

export const updateStatus = async (
  id: string,
  status: boolean,
  updatedBy?: string
) => {
  return await prisma.projectMasterPlanPin.update({
    where: { id },
    data: { status, updatedBy },
  });
};
