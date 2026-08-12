import { prisma } from "../../config/prisma.config.js";
import logger from "../../utils/logger.utils.js";
import { IPageCreateDTO, IPageUpdateDTO } from "./page.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createPage(data: IPageCreateDTO) {
  const slug = slugify(data.pageName, { lower: true });
  const existing = await prisma.pages.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  let prismaData: any = {
    pageName: data.pageName,
    slug,
    title: data.title,
    description: data.description,
    alt: data.alt,
    watermark: data.watermark,
    files: data.files,
    type: data.type,
    link: data.link,
    seoTags: data.seoTags,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };
  return prisma.pages.create({ data: prismaData });
}

export async function getDistinctPageList() {
  return prisma.pages.findMany({
    select: {
      id: true,
      pageName: true,
      slug: true,
    },
    where: {
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
  });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ pageName: { contains: search, mode: "insensitive" } }],
      }
    : {};
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.pages,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getAllParentPageList(page = 1, limit = 10, search = "") {
  const where = {
    AND: [
      {
        OR: [{ parentId: null }, { parentId: "" }],
      },
      ...(search
        ? [
            {
              OR: [{ pageName: { contains: search, mode: "insensitive" } }],
            },
          ]
        : []),
    ],
  };

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.pages,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updatePage(id: string, data: IPageUpdateDTO) {
  // added for slug generate
  let slug = slugify(data.pageName, { lower: true });
  if (data.pageName) {
    const existing = await prisma.pages.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    if (existing) {
      throw new ApiError(400, "Slug already exists");
    }
  }
  const prismaData = Object.fromEntries(
    Object.entries({
      pageName: data.pageName,
      slug: slug,
      title: data.title,
      description: data.description,
      files: data.files,
      type: data.type,
      link: data.link,
      alt: data.alt,
      watermark: data.watermark,
      seoTags: data.seoTags,
      status: data.status,
      seq: data.seq,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );
  logger.info(prismaData);
  return prisma.pages.update({
    where: { id },
    data: prismaData,
  });
}

export async function getPageById(id: string) {
  return prisma.pages.findUnique({
    where: { id },
  });
}

export async function deletePageById(id: string) {
  return prisma.pages.delete({
    where: { id },
  });
}

export async function updatePageSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.pages.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.pages.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
