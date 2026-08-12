import { prisma } from "../../config/prisma.config.js";
import { IBlogFaqDTO, IBlogFaqUpdateDTO } from "./blogFaq.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createBlogFaq(data: IBlogFaqDTO) {
  let prismaData: any = {
    blogId: data.blogId,
    question: data.question,
    answer: data.answer,
    createdBy: data.createdBy,
  };
  return (prisma as any).blogFaq.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  blogId: string,
) {
  let where: any = {
    blogId,
  };

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
    (prisma as any).blogFaq,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateBlogFaq(id: string, data: IBlogFaqUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      question: data.question,
      answer: data.answer,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );
  return (prisma as any).blogFaq.update({
    where: { id },
    data: prismaData,
  });
}

export async function getBlogFaqById(id: string) {
  return (prisma as any).blogFaq.findUnique({
    where: { id },
  });
}

export async function deleteBlogFaq(id: string) {
  return (prisma as any).blogFaq.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return (prisma as any).blogFaq.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return (prisma as any).blogFaq.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
