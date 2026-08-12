import { prisma } from "../../config/prisma.config.js";
import logger from "../../utils/logger.utils.js";
import {
  ISeoFooterLinkDTO,
  ISeoFooterLinkUpdateDTO,
} from "./seoFooterLink.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { SeoLinkType } from "../../generated/prisma/enums.js";

export async function createSeoFooterLink(data: ISeoFooterLinkDTO) {
  return prisma.seoFooterLink.create({
    data: {
      label: data.label,
      slug: data.slug,
      type: data.type as SeoLinkType,
      seq: data.seq ?? 0,
      ...(data.projectId && { projects: { connect: { id: data.projectId } } }),
    },
  });
}

export async function getAllSeoFooterLinks(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [
          { label: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.seoFooterLink,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getSeoFooterLinkById(id: string) {
  return prisma.seoFooterLink.findUnique({
    where: { id },
  });
}

export async function updateSeoFooterLink(
  id: string,
  data: ISeoFooterLinkUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      ...(data.projectId && { projects: { connect: { id: data.projectId } } }),
      label: data.label,
      slug: data.slug,
      type: data.type,
      seq: data.seq,
    }).filter(([_, v]) => v !== undefined),
  );
  logger.info("prismaData", prismaData);
  return prisma.seoFooterLink.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteSeoFooterLink(id: string) {
  return prisma.seoFooterLink.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.seoFooterLink.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
