import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ICsrCategoryCreateDTO, ICsrCategoryUpdateDTO } from "./csrCategory.interface.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export const createCategory = async (data: ICsrCategoryCreateDTO) => {
  const slug = slugify(data.name, { lower: true, strict: true });
  return await prisma.csrCategory.create({
    data: {
      name: data.name,
      slug: slug,
      createdBy: data.createdBy,
    },
  });
};

export const getAllCategories = async (
  page: number,
  limit: number,
  search: string,
) => {
  const whereClause: any = {
    isDeleted: false,
  };

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }

  return paginate(
    prisma.csrCategory,
    {
      where: whereClause,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
};

export const getCategoryById = async (id: string) => {
  return await prisma.csrCategory.findFirst({
    where: { id, isDeleted: false },
  });
};

export const updateCategory = async (
  id: string,
  data: ICsrCategoryUpdateDTO,
) => {
  let slug = data.slug;
  if (data.name && !slug) {
    slug = slugify(data.name, { lower: true, strict: true });
  }

  return await prisma.csrCategory.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(slug ? { slug } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.seq !== undefined ? { seq: data.seq } : {}),
      ...(data.updatedBy ? { updatedBy: data.updatedBy } : {}),
    },
  });
};

export const deleteCategory = async (id: string) => {
  return await prisma.csrCategory.delete({
    where: { id },
  });
};

export const updateSeq = async (id: string, data: any) => {
  return await prisma.csrCategory.update({
    where: { id },
    data: { seq: data.seq, updatedBy: data.updatedBy },
  });
};

export const updateStatus = async (
  id: string,
  status: boolean,
  updatedBy?: string,
) => {
  return await prisma.csrCategory.update({
    where: { id },
    data: { status, updatedBy },
  });
};
