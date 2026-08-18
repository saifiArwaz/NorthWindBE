import { prisma } from "../../config/prisma.config.js";
import {
  IEventCategoryDTO,
  IEventCategoryUpdateDTO,
} from "./eventCategory.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { ApiError } from "../../utils/apiError.utils.js";

export async function createEventCategory(data: IEventCategoryDTO) {
  let slug = data.slug;
  if (!slug && data.name) {
    slug = slugify(data.name, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.eventCategory.findUnique({ where: { slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }

  return prisma.eventCategory.create({
    data: {
      name: data.name,
      slug: slug,
      event: { connect: { id: data.eventId } },
      files: data.files,
      status: data.status,
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
    },
  });
}

export async function getAllList(page = 1, limit = 10, search = "", eventId?: string) {
  const where: any = { isDeleted: false };
  
  if (eventId) {
    where.eventId = eventId;
  }
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.eventCategory,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getEventCategoryById(id: string) {
  return prisma.eventCategory.findUnique({
    where: { id, isDeleted: false },
  });
}

export async function updateEventCategory(
  id: string,
  data: IEventCategoryUpdateDTO,
) {
  let slug = data.slug;
  if (data.name && !slug) {
    slug = slugify(data.name, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.eventCategory.findUnique({ where: { slug } });
    if (existing && existing.id !== id) throw new ApiError(400, "Slug already exists");
  }

  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      slug: slug,
      files: data.files,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.eventCategory.update({
    where: { id },
    data: prismaData,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.eventCategory.update({
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
  return prisma.eventCategory.update({
    where: { id },
    data,
  });
}

// Helper to fetch all galleries under a category
async function fetchCategoryGalleriesDescendants(categoryId: string): Promise<string[]> {
  const galleries = await prisma.eventGalleries.findMany({
    where: { categoryId, isDeleted: false },
    select: { id: true }
  });
  return galleries.map(g => g.id);
}

export async function deleteEventCategory(id: string) {
  const galleryIds = await fetchCategoryGalleriesDescendants(id);
  
  return prisma.$transaction(async (tx) => {
    if (galleryIds.length > 0) {
      await tx.eventGalleries.updateMany({
        where: { id: { in: galleryIds } },
        data: { isDeleted: true }
      });
    }

    return tx.eventCategory.update({
      where: { id },
      data: { isDeleted: true }
    });
  });
}
