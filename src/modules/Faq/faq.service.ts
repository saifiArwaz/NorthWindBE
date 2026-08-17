import { prisma } from "../../config/prisma.config.js";
import { IFaqDTO, IFaqUpdateDTO } from "./faq.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { FaqTypes } from "../../generated/prisma/enums.js";

export async function createFaq(data: IFaqDTO) {
  let prismaData: any = {
    type: data.type as FaqTypes,
    question: data.question,
    answer: data.answer,
    createdBy: data.createdBy,
  };
  return prisma.faqs.create({ data: prismaData });
}

export async function getAllList(
  type?: string,
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {};

   if (type) {
    where.type = type as FaqTypes;
  } 
  if (search) {
    where.OR = [
      { question: { contains: search, mode: "insensitive" } },
      { answer: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.faqs,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateFaq(id: string, data: IFaqUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      type: data.type as FaqTypes,
      question: data.question,
      answer: data.answer,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );
  return prisma.faqs.update({
    where: { id },
    data: prismaData,
  });
}

export async function getFaqById(id: string) {
  return prisma.faqs.findUnique({
    where: { id },
  });
}

export async function deleteFaq(id: string) {
  return prisma.faqs.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.faqs.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.faqs.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
