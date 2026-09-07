import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { IProjectMasterPlanCategoryDTO, IProjectMasterPlanCategoryUpdateDTO } from "./projectMasterPlanCategory.interface.js";

export const createCategory = async (data: IProjectMasterPlanCategoryDTO) => {
  return await prisma.projectMasterPlanCategory.create({
    data: {
      name: data.name,
      createdBy: data.createdBy,
    },
  });
};

export const getAllCategories = async (
  page: number,
  limit: number,
  search: string
) => {
  const whereClause: any = {
    isDeleted: false,
  };

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }

  return paginate(
    prisma.projectMasterPlanCategory,
    {
      where: whereClause,
      orderBy: { seq: "asc" },
    },
    { page, limit }
  );
};

export const getCategoryById = async (id: string) => {
  return await prisma.projectMasterPlanCategory.findFirst({
    where: { id, isDeleted: false },
  });
};

export const updateCategory = async (
  id: string,
  data: IProjectMasterPlanCategoryUpdateDTO
) => {
  return await prisma.projectMasterPlanCategory.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: string) => {
  return await prisma.projectMasterPlanCategory.delete({
    where: { id }
    });
};

export const updateSeq = async (id: string, data: any) => {
  return await prisma.projectMasterPlanCategory.update({
    where: { id },
    data: { seq: data.seq, updatedBy: data.updatedBy },
  });
};

export const updateStatus = async (
  id: string,
  status: boolean,
  updatedBy?: string
) => {
  return await prisma.projectMasterPlanCategory.update({
    where: { id },
    data: { status, updatedBy },
  });
};

