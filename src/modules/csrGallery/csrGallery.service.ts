import { prisma } from "../../config/prisma.config.js";
import { ICsrGalleryCreateDTO, ICsrGalleryUpdateDTO } from "./csrGallery.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createCsrGallery(data: ICsrGalleryCreateDTO) {
  const prismaData: any = {
    title: data.title,
    ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
    files: data.files,
    link: data.link,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy && {
      creator: { connect: { id: data.createdBy } },
    }),
  };

  return prisma.csrGallery.create({
    data: prismaData,
    include: { category: true },
  });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  categoryId?: string,
) {
  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { alt: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  return paginate(
    prisma.csrGallery,
    {
      where,
      orderBy: { seq: "asc" },
      include: { category: true },
    },
    { page, limit },
  );
}

export async function getCsrGalleryById(id: string) {
  return prisma.csrGallery.findUnique({
    where: { id, isDeleted: false },
    include: { category: true },
  });
}

export async function updateCsrGallery(
  id: string,
  data: ICsrGalleryUpdateDTO,
) {
  const prismaData: any = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.link !== undefined && { link: data.link }),
    ...(data.alt !== undefined && { alt: data.alt }),
    ...(data.watermark !== undefined && { watermark: data.watermark }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.seq !== undefined && { seq: data.seq }),
    ...(data.files !== undefined && { files: data.files }),
    ...(data.categoryId !== undefined
      ? data.categoryId
        ? { category: { connect: { id: data.categoryId } } }
        : { category: { disconnect: true } }
      : {}),
    ...(data.updatedBy && {
      updatedUser: { connect: { id: data.updatedBy } },
    }),
  };

  return prisma.csrGallery.update({
    where: { id },
    data: prismaData,
    include: { category: true },
  });
}

export async function deleteCsrGalleryById(id: string) {
  return prisma.csrGallery.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, data: any) {
  return prisma.csrGallery.update({
    where: { id },
    data: {
      seq: data.seq,
      ...(data.updatedBy && { updatedUser: { connect: { id: data.updatedBy } } }),
    },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.csrGallery.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && { updatedUser: { connect: { id: updatedBy } } }),
    },
  });
}
