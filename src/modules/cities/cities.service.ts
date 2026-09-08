import { prisma } from "../../config/prisma.config.js";
import { ICitiesDTO, ICitiesUpdateDTO } from "./cities.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createCity(data: ICitiesDTO) {
  const slug = slugify(data.name, { lower: true, strict: true });
  const existing = await prisma.city.findFirst({
    where: { slug, isDeleted: false },
  });
  if (existing) throw new ApiError(400, "City with this slug already exists");

  let prismaData: any = {
    name: data.name,
    slug: slug,
    seoTags: data.seoTags,
    ...(data.stateId ? { state: { connect: { id: data.stateId } } } : {}),
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.city.create({
    data: prismaData,
    include: {
      state: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  stateId = "",
) {
  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (stateId) {
    where.stateId = stateId;
  }

  return paginate(
    prisma.city,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function updateCity(id: string, data: ICitiesUpdateDTO) {
  let slug: string | undefined;
  if (data.name) {
    slug = slugify(data.name, { lower: true, strict: true });
    const existing = await prisma.city.findFirst({
      where: { slug, isDeleted: false, NOT: { id } },
    });
    if (existing) {
      throw new ApiError(400, "City with this slug already exists");
    }
  }

  let prismaData: any = {
    ...(data.name ? { name: data.name } : {}),
    ...(slug ? { slug } : {}),
    ...(data.seoTags !== undefined ? { seoTags: data.seoTags } : {}),
    ...(data.stateId !== undefined
      ? data.stateId
        ? { state: { connect: { id: data.stateId } } }
        : { state: { disconnect: true } }
      : {}),
    ...(data.updatedBy
      ? { updatedUser: { connect: { id: data.updatedBy } } }
      : {}),
  };

  return prisma.city.update({
    where: { id },
    data: prismaData,
  });
}

export async function getCityById(id: string) {
  return prisma.city.findFirst({
    where: { id, isDeleted: false },
  });
}

export async function deleteCityById(id: string) {
  return prisma.city.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.city.update({
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
  let data: any = { seq };
  if (updatedBy) {
    data.updatedUser = { connect: { id: updatedBy } };
  }
  return prisma.city.update({
    where: { id },
    data,
  });
}
