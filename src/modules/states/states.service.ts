import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { IStateDTO, IStateUpdateDTO } from "./states.interface.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createState(data: IStateDTO) {
  const slug = slugify(data.name, { lower: true, strict: true });
  const existing = await prisma.state.findFirst({
    where: { slug },
  });
  if (existing) {
    throw new ApiError(400, "State with this slug already exists");
  }

  return prisma.state.create({
    data: {
      name: data.name,
      slug,
      ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
    },
  });
}

export async function getAllStates(page = 1, limit = 10, search = "") {
  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  return paginate(
    prisma.state,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getStateById(id: string) {
  return prisma.state.findFirst({
    where: { id, isDeleted: false },
  });
}

export async function updateState(id: string, data: IStateUpdateDTO) {
  let slug = data.slug;
  if (data.name && !slug) {
    slug = slugify(data.name, { lower: true, strict: true });
  }

  if (slug) {
    const existing = await prisma.state.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    if (existing) {
      throw new ApiError(400, "State with this slug already exists");
    }
  }

  return prisma.state.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(slug ? { slug } : {}),
      ...(data.updatedBy
        ? { updatedUser: { connect: { id: data.updatedBy } } }
        : {}),
    },
  });
}

export async function deleteStateById(id: string) {
  return prisma.state.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.state.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, seq: number, updatedBy?: string) {
  return prisma.state.update({
    where: { id },
    data: {
      seq,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
