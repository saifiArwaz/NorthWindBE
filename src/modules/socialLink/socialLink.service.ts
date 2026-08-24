import { prisma } from "../../config/prisma.config.js";
import {
  ISocialLinkDTO,
  ISocialLinkUpdateDTO,
} from "./socialLink.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createSocialLink(data: ISocialLinkDTO) {
  const prismaData: any = {
    key: data.key,
    socialLink: data.socialLink,
    createdBy: data.createdBy,
  };

  return prisma.socialLinks.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ key: { contains: search, mode: "insensitive" } }],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.socialLinks,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getSocialLinkById(id: string) {
  return prisma.socialLinks.findUnique({
    where: { id },
  });
}

export async function updateSocialLink(id: string, data: ISocialLinkUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      key: data.key,
      socialLink: data.socialLink,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.socialLinks.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteSocialLink(id: string) {
  return prisma.socialLinks.delete({
    where: { id },
  });
}

export async function updateSocialLinkSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.socialLinks.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.socialLinks.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
