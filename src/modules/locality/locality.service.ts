import { prisma } from "../../config/prisma.config.js";
import { ILocalityDTO, ILocalityUpdateDTO } from "./locality.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createLocality(data: ILocalityDTO) {
  const slug = slugify(data.name, { lower: true });
  const existing = await prisma.locality.findFirst({ where: { slug } });
  if (existing) throw new ApiError(400, "Slug already exists");

  return prisma.locality.create({
    data: {
      name: data.name,
      slug: slug,
      cityId: data.cityId,
    },
  });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }
    : {};
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.locality,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function updateLocality(id: string, data: ILocalityUpdateDTO) {
  let slug;
  if (data.name) {
    slug = slugify(data.name, { lower: true });
    const existing = await prisma.locality.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      throw new ApiError(400, "Locality already exists with this name");
    }
  }

  let prismaData: any = {};
  if (data.name) prismaData.name = data.name;
  if (slug) prismaData.slug = slug;
  if (data.cityId) prismaData.cityId = data.cityId;
  if (data.status !== undefined) prismaData.status = data.status;

  return prisma.locality.update({
    where: { id },
    data: prismaData,
  });
}

export async function getLocalityById(id: string) {
  return prisma.locality.findUnique({
    where: { id },
  });
}

export async function deleteLocalityById(id: string) {
  return prisma.locality.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.locality.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
