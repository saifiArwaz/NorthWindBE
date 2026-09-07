import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import {
  IProjectMasterPlanPinGalleryDTO,
  IProjectMasterPlanPinGalleryUpdateDTO,
} from "./projectMasterPlanPinGallery.interface.js";

export const createGallery = async (data: IProjectMasterPlanPinGalleryDTO) => {
  return await prisma.projectMasterPlanPinGallery.create({
    data: {
      pinId: data.pinId,
      title: data.title,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      createdBy: data.createdBy,
    },
  });
};

export const getAllGalleries = async (
  page: number,
  limit: number,
  search: string,
  pinId: string
) => {
  const whereClause: any = {
    isDeleted: false,
    pinId,
  };

  if (search) whereClause.alt = { contains: search, mode: "insensitive" };

  return paginate(
    prisma.projectMasterPlanPinGallery,
    {
      where: whereClause,
      orderBy: { seq: "asc" },
    },
    { page, limit }
  );
};

export const getGalleryById = async (id: string) => {
  return await prisma.projectMasterPlanPinGallery.findFirst({
    where: { id, isDeleted: false },
  });
};

export const updateGallery = async (
  id: string,
  data: IProjectMasterPlanPinGalleryUpdateDTO
) => {
  return await prisma.projectMasterPlanPinGallery.update({
    where: { id },
    data: {
      pinId: data.pinId,
      title: data.title,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      updatedBy: data.updatedBy,
    },
  });
};

export const deleteGallery = async (id: string) => {
  return await prisma.projectMasterPlanPinGallery.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const updateSeq = async (id: string, data: any) => {
  return await prisma.projectMasterPlanPinGallery.update({
    where: { id },
    data: { seq: data.seq, updatedBy: data.updatedBy },
  });
};

export const updateStatus = async (
  id: string,
  status: boolean,
  updatedBy?: string
) => {
  return await prisma.projectMasterPlanPinGallery.update({
    where: { id },
    data: { status, updatedBy },
  });
};
