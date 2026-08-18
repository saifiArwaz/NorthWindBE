import { prisma } from "../../config/prisma.config.js";
import {
  IEventCategoryDTO,
  IEventCategoryUpdateDTO,
} from "./eventCategory.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createEventCategory(data: IEventCategoryDTO) {
  return prisma.eventCategory.create({
    data: {
      name: data.name,
      event: { connect: { id: data.eventId } },
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
  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
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
