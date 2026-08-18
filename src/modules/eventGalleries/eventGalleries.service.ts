import { prisma } from "../../config/prisma.config.js";
import {
  IEventsGalleryDTO,
  IEventsGalleryUpdateDTO,
} from "./eventGalleries.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FileType } from "../../generated/prisma/enums.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;
import { ApiError } from "../../utils/apiError.utils.js";

export async function createEventsGallery(data: IEventsGalleryDTO) {
  let slug = data.slug;
  if (!slug && data.title) {
    slug = slugify(data.title, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.eventGalleries.findUnique({ where: { slug } });
    if (existing) throw new ApiError(400, "Slug already exists");
  }

  let prismaData: any = {
    title: data.title,
    slug: slug,
    fileType: data.fileType as FileType,
    category: { connect: { id: data.categoryId } },
    ...(data.parentGalleryId && { parentGallery: { connect: { id: data.parentGalleryId } } }),
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    ...(data.createdBy && {
      creator: { connect: { id: data.createdBy } },
    }),
  };
  return prisma.eventGalleries.create({
    data: prismaData,
    include: { category: true, parentGallery: true },
  });
}

export async function getAllList(page = 1, limit = 10, search = "", categoryId?: string) {
  const where: any = {};
  if (search) {
    where.OR = [{ alt: { contains: search, mode: "insensitive" } }];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  const paginatedResult = await paginate(
    prisma.eventGalleries,
    {
      where,
      orderBy: { createdAt: "desc" },
      include: { 
        category: true, 
        parentGallery: true,
        _count: { select: { childGalleries: { where: { isDeleted: false } } } }
      },
    },
    { page, limit },
  ) as any;

  paginatedResult.data = paginatedResult.data.map((item: any) => ({
    ...item,
    hasGallery: item._count?.childGalleries > 0,
  }));

  return paginatedResult;
}

async function validateCircularHierarchy(galleryId: string, newParentId: string | undefined) {
  if (!newParentId) return;
  if (galleryId === newParentId) throw new Error("Circular Reference: Cannot set gallery as its own parent");

  let currentParentId = newParentId;
  while (currentParentId) {
    const parent = await prisma.eventGalleries.findUnique({
      where: { id: currentParentId },
      select: { parentGalleryId: true }
    });
    if (!parent) break;
    if (parent.parentGalleryId === galleryId) {
      throw new Error("Circular Reference: Cannot set descendant as parent");
    }
    currentParentId = parent.parentGalleryId as string;
  }
}

export async function updateEventsGallery(
  id: string,
  data: IEventsGalleryUpdateDTO,
) {
  if (data.parentGalleryId) {
    await validateCircularHierarchy(id, data.parentGalleryId);
  }

  let slug = data.slug;
  if (data.title && !slug) {
    slug = slugify(data.title, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.eventGalleries.findUnique({ where: { slug } });
    if (existing && existing.id !== id) throw new ApiError(400, "Slug already exists");
  }

  const prismaData: any = Object.fromEntries(
    Object.entries({
      title: data.title,
      slug: slug,
      fileType: data.fileType as FileType,
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
      ...(data.parentGalleryId && { parentGallery: { connect: { id: data.parentGalleryId } } }),
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  // Allow unsetting parent if passed explicitly as null
  if (data.parentGalleryId === null) {
    prismaData.parentGallery = { disconnect: true };
  }

  return prisma.eventGalleries.update({
    where: { id },
    data: prismaData,
    include: { category: true, parentGallery: true },
  });
}

export async function getEventsGalleryById(id: string) {
  const record = await prisma.eventGalleries.findUnique({
    where: { id, isDeleted: false },
    include: { 
      category: true, 
      parentGallery: true,
      _count: { select: { childGalleries: { where: { isDeleted: false } } } }
    },
  });

  if (record) {
    (record as any).hasGallery = record._count?.childGalleries > 0;
  }

  return record;
}

// Helper to fetch all descendants for soft delete
async function fetchAllDescendants(galleryIds: string[]): Promise<string[]> {
  const children = await prisma.eventGalleries.findMany({
    where: { parentGalleryId: { in: galleryIds }, isDeleted: false },
    select: { id: true }
  });
  if (children.length === 0) return [];
  const childIds = children.map(c => c.id);
  const deepChildren = await fetchAllDescendants(childIds);
  return [...childIds, ...deepChildren];
}

export async function deleteEventsGalleryById(id: string) {
  const descendantIds = await fetchAllDescendants([id]);
  const allIds = [id, ...descendantIds];
  
  return prisma.eventGalleries.updateMany({
    where: { id: { in: allIds } },
    data: { isDeleted: true }
  });
}

export async function updateEventGallerySeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.eventGalleries.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.eventGalleries.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateFeature(
  id: string,
  isFeature: boolean,
  updatedBy?: string,
) {
  return prisma.eventGalleries.update({
    where: { id },
    data: {
      isFeature,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
