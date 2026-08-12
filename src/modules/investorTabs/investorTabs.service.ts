import { prisma } from "../../config/prisma.config.js";
import {
  IInvestorTabsDTO,
  IInvestorTabsUpdateDTO,
} from "./investorTabs.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createInvestorTabs(data: IInvestorTabsDTO) {
  const slug = slugify(data.title, { lower: true });
  const existing = await prisma.inverstorTabs.findFirst({
    where: {
      slug,
    },
  });
  if (existing)
    throw new ApiError(400, "Slug already exists for this developer");

  const prismaData: any = {
    title: data.title,
    slug: slug,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    createdBy: data.createdBy,
  };

  return prisma.inverstorTabs.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = {};

  if (search) {
    where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.inverstorTabs,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getInvestorTabsById(id: string) {
  return prisma.inverstorTabs.findUnique({
    where: { id },
  });
}

export async function updateInvestorTabs(
  id: string,
  data: IInvestorTabsUpdateDTO,
) {
  const slug = slugify(data.title, { lower: true });
  const existing = await prisma.inverstorTabs.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });
  if (existing)
    throw new ApiError(400, "Slug already exists for this developer");

  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      slug: slug,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.inverstorTabs.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteInvestorTabs(id: string) {
  return prisma.inverstorTabs.delete({
    where: { id },
  });
}

export async function updateInvestorTabsSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.inverstorTabs.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.inverstorTabs.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
