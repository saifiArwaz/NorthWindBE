import { prisma } from "../../config/prisma.config.js";
import { IBlogCreateDTO, IBlogUpdateDTO } from "./blogs.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createBlog(data: IBlogCreateDTO) {
  let slug = data.slug;

  if (data.slug) {
    slug = slugify(data.slug, { lower: true });
    const existing = await prisma.blogs.findFirst({ where: { slug: data.slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }
  if(!data.slug){
    slug = slugify(data.title, { lower: true });
    const existing = await prisma.blogs.findFirst({ where: { slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }

  if(data.title){
    const existing = await prisma.blogs.findFirst({where : { title: data.title }});
    if(existing) throw new ApiError(400, "Title already exists")
  }

  let prismaData: any = {
    title: data.title,
    slug: slug,
    dateAt: data.dateAt,
    description: data.description,
    alt: data.alt,
    watermark: data.watermark,
    files: data.files,
    seoTags: data.seoTags ?? null,
    isFeature: data.isFeature,
    isHome: data.isHome,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };
  return prisma.blogs.create({ data: prismaData });
}

export async function getAllBlog(
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.blogs,
    {
      where,
      orderBy: [{ seq: "asc" }, { dateAt: "desc" }],
    },
    { page, limit },
  );
}

export async function updateBlog(id: string, data: IBlogUpdateDTO) {
  // added for slug generate
  let slug = data.slug;

  if (data.slug) {
    slug = slugify(data.slug, { lower: true });
    const existing = await prisma.blogs.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existing) throw new ApiError(400, "Slug already exists");
  }
  if(!data.slug){
    slug = slugify(data.title, { lower: true });
    const existing = await prisma.blogs.findFirst({ where: { slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }

  if (data.title) {
    const existing = await prisma.blogs.findFirst({
      where: {
        title: data.title,
        NOT: { id },
      },
    });
    if (existing) {
      throw new ApiError(400, "Title already exists");
    }
  }
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      slug: data.slug,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      dateAt: data.dateAt,
      seoTags: data.seoTags,
      isFeature: data.isFeature,
      isHome: data.isHome,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.blogs.update({
    where: { id },
    data: prismaData,
  });
}

export async function getBlogById(id: string) {
  return prisma.blogs.findUnique({
    where: { id },
  });
}

export async function deleteBlogById(id: string) {
  return prisma.blogs.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.blogs.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateBlogsSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.blogs.update({
    where: { id },
    data,
  });
}

export async function updateIsLatest(id: string, isLatest: boolean, updatedBy?: string) {
  return prisma.blogs.update({
    where: { id },
    data: {
      isLatest,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateIsFeature(id: string, isFeature: boolean, updatedBy?: string) {
  return prisma.blogs.update({
    where: { id },
    data: {
      isFeature,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateIsHome(id: string, isHome: boolean, updatedBy?: string) {
  return prisma.blogs.update({
    where: { id },
    data: {
      isHome,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}