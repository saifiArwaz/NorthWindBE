import { prisma } from "../../config/prisma.config.js";
import {
  IInvestorDocumentsDTO,
  IInvestorDocumentsUpdateDTO,
} from "./investorDocument.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createInvestorDocuments(data: IInvestorDocumentsDTO) {
  const prismaData: any = {
    inverstorTabId: data.inverstorTabId,
    title: data.title,
    type: data.type,
    files: data.files,
    alt: data.alt,
    sub_title: data.sub_title,
    label: data.label,
    watermark: data.watermark,
    list: data.list,
    createdBy: data.createdBy,
  };

  return prisma.investorDocuments.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  tabId?: string,
) {
  const where: any = { inverstorTabId: tabId };

  if (search) {
    where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.investorDocuments,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function getInvestorDocumentsById(id: string) {
  return prisma.investorDocuments.findUnique({
    where: { id },
  });
}

export async function updateInvestorDocuments(
  id: string,
  data: IInvestorDocumentsUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      type: data.type,
      files: data.files,
      alt: data.alt,
      sub_title: data.sub_title,
      label: data.label,
      watermark: data.watermark,
      list: data.list,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.investorDocuments.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteInvestorDocuments(id: string) {
  return prisma.investorDocuments.delete({
    where: { id },
  });
}

export async function updateInvestorDocumentsSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.investorDocuments.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.investorDocuments.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
