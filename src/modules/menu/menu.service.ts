import { prisma } from "../../config/prisma.config.js";
import { IMenuItemDTO, IMenuItemUpdateDTO } from "./menu.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createTeamSection(data: IMenuItemDTO) {
  let prismaData: any = {
    label: data.label,
    ...(data.pageId ? { page: { connect: { id: data.pageId } } } : {}),
    ...(data.parentId ? { parent: { connect: { id: data.parentId } } } : {}),
  };
  return prisma.menuItem.create({ data: prismaData });
}

export async function getMenuTree(page = 1, limit = 10) {
  // Top-level only, paginated

  return paginate(
    prisma.menuItem,
    {
      where: {
        parentId: null,
      },
      select: {
        id: true,
        label: true,
        page: {
          select: { slug: true },
        },
        children: {
          select: {
            id: true,
            label: true,
            page: {
              select: { slug: true },
            },
          },
          orderBy: { seq: "asc" },
        },
      },
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateTeamSection(id: string, data: IMenuItemUpdateDTO) {
  const prismaData: any = {};

  if (data.label !== undefined) prismaData.label = data.label;

  if (data.pageId === null) {
    prismaData.page = { disconnect: true };
  } else if (data.pageId) {
    prismaData.page = { connect: { id: data.pageId } };
  }

  if (data.parentId === null) {
    prismaData.parent = { disconnect: true };
  } else if (data.parentId) {
    if (data.parentId === id) {
      throw new ApiError(404, "Cannot set itself as parent");
    }
    prismaData.parent = { connect: { id: data.parentId } };
  }

  return prisma.menuItem.update({
    where: { id },
    data: prismaData,
  });
}

export async function getTeamSectionById(id: string) {
  return prisma.menuItem.findUnique({
    where: { id },
  });
}

export async function deleteTeamSectionById(id: string) {
  return prisma.menuItem.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.menuItem.update({
    where: { id },
    data,
  });
}
