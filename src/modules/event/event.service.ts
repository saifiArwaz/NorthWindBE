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
      type: data.type,
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

// Memory tree builder (no longer builds a tree since parentGalleryId was removed, just formats the response)
export async function getEventByIdWithTree(id: string) {
  const event = await prisma.event.findUnique({
    where: { id, isDeleted: false },
    include: {
      categories: {
        where: { isDeleted: false },
        orderBy: { seq: "asc" },
        include: {
          events: { // These are the EventGalleries for this category
            where: { isDeleted: false },
            orderBy: { seq: "asc" },
          },
        },
      },
    },
  });

  if (!event) return null;

  // Map to format response
  const treeCategories = event.categories.map((category) => {
    return {
      ...category,
      galleries: category.events,
      events: undefined, // remove flat list from response
    };
  });

  return {
    ...event,
    categories: treeCategories,
  };
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
      type: data.type,
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

// Delete event soft deletes all categories and all galleries
export async function deleteEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          events: true, // galleries
        }
      },
      galleries: true,
    }
  });

  if (!event) return null;

  // Collect all category IDs and gallery IDs
  const categoryIds = event.categories.map(c => c.id);
  const categoryGalleryIds = event.categories.flatMap(c => c.events.map(g => g.id));
  const directGalleryIds = event.galleries.map(g => g.id);
  const allGalleryIds = [...categoryGalleryIds, ...directGalleryIds];

  // Perform soft deletion in transaction
  return prisma.$transaction(async (tx) => {
    if (allGalleryIds.length > 0) {
      await tx.eventGalleries.updateMany({
        where: { id: { in: allGalleryIds } },
        data: { isDeleted: true },
      });
    }

    if (categoryIds.length > 0) {
      await tx.eventCategory.updateMany({
        where: { id: { in: categoryIds } },
        data: { isDeleted: true },
      });
    }

    return tx.event.update({
      where: { id },
      data: { isDeleted: true },
    });
  });
}
