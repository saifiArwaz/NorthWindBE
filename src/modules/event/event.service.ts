import { prisma } from "../../config/prisma.config.js";
import { IEventDTO, IEventUpdateDTO } from "./event.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createEvent(data: IEventDTO) {
  return prisma.event.create({
    data: {
      title: data.title,
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

// Memory tree builder
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

  // Reconstruct tree
  const treeCategories = event.categories.map((category) => {
    const flatGalleries = category.events; // all galleries for category
    const galleryMap = new Map();
    
    // Initialize map
    for (const g of flatGalleries) {
      galleryMap.set(g.id, { ...g, children: [] });
    }

    const rootGalleries: any[] = [];

    for (const g of flatGalleries) {
      const gWithChildren = galleryMap.get(g.id);
      if (g.parentGalleryId && galleryMap.has(g.parentGalleryId)) {
        galleryMap.get(g.parentGalleryId).children.push(gWithChildren);
      } else {
        rootGalleries.push(gWithChildren);
      }
    }

    return {
      ...category,
      galleries: rootGalleries,
      events: undefined, // remove flat list from response
    };
  });

  return {
    ...event,
    categories: treeCategories,
  };
}


export async function updateEvent(id: string, data: IEventUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
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
      }
    }
  });

  if (!event) return null;

  // Collect all category IDs and gallery IDs
  const categoryIds = event.categories.map(c => c.id);
  const galleryIds = event.categories.flatMap(c => c.events.map(g => g.id));

  // Perform soft deletion in transaction
  return prisma.$transaction(async (tx) => {
    if (galleryIds.length > 0) {
      await tx.eventGalleries.updateMany({
        where: { id: { in: galleryIds } },
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
