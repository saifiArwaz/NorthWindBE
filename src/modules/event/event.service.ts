import { prisma } from "../../config/prisma.config.js";
import { IEventDTO, IEventUpdateDTO } from "./event.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { ApiError } from "../../utils/apiError.utils.js";

export async function createEvent(data: IEventDTO) {
  let slug = data.slug;
  if (!slug && data.title) {
    slug = slugify(data.title, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }

  return prisma.event.create({
    data: {
      title: data.title,
      slug: slug,
      status: data.status,
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
    },
  });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = { isDeleted: false };
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
    prisma.event,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id, isDeleted: false },
  });
}

export async function updateEvent(id: string, data: IEventUpdateDTO) {
  let slug = data.slug;
  if (data.title && !slug) {
    slug = slugify(data.title, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing && existing.id !== id) throw new ApiError(400, "Slug already exists");
  }

  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      slug: slug,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.event.update({
    where: { id },
    data: prismaData,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.event.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.event.update({
    where: { id },
    data,
  });
}

// Delete event blocks if it has categories or media
export async function deleteEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      categories: {
        where: { isDeleted: false },
      },
      galleries: {
        where: { isDeleted: false },
      },
    }
  });

  if (!event) return null;

  if (event.categories.length > 0 || event.galleries.length > 0) {
    throw new ApiError(400, "Event cannot be deleted because it has active categories or media.");
  }

  // Perform hard deletion
  return prisma.event.delete({
    where: { id },
  });
}
