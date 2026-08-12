import { prisma } from "../../config/prisma.config.js";
import {
  IBlogCategoriesDTO,
  IBlogCategoriesUpdateDTO,
} from "./blog-categories.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createBlogCategories(data: IBlogCategoriesDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.blogCategories.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.blogCategories.create({ data: prismaData });
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
    prisma.blogCategories,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateBlogCategories(
  id: string,
  data: IBlogCategoriesUpdateDTO,
) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.blogCategories.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    throw new ApiError(400, "BlogCategories Already exists");
  }
  let prismaData: any = {
    name: data.name,
    slug: slug,
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.blogCategories.update({
    where: { id },
    data: prismaData,
  });
}

export async function getBlogCategoriesById(id: string) {
  return prisma.blogCategories.findUnique({
    where: { id },
  });
}

export async function deleteBlogCategoriesById(id: string) {
  return prisma.blogCategories.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.blogCategories.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
