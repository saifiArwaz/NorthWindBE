import { prisma } from "../../config/prisma.config.js";
import {
  IInvestorAppreciationCreateDTO,
  IInvestorAppreciationUpdateDTO,
} from "./investorAppreciation.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createInvestorAppreciation(
  data: IInvestorAppreciationCreateDTO,
) {
  const prismaData: any = {
    year: data.year,
    bsp: data.bsp,
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };

  return prisma.investorAppreciation.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = {
    isDeleted: false,
  };

  if (search && search.trim() !== "") {
    where.OR = [
      { year: { contains: search, mode: "insensitive" } },
      { bsp: { contains: search, mode: "insensitive" } },
    ];
  }

  return paginate(
    prisma.investorAppreciation,
    {
      where,
      orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
    },
    { page, limit },
  );
}

export async function getInvestorAppreciationById(id: string) {
  const record = await prisma.investorAppreciation.findUnique({
    where: { id, isDeleted: false },
  });
  if (!record) {
    throw new ApiError(404, "Investor appreciation record not found");
  }
  return record;
}

export async function updateInvestorAppreciation(
  id: string,
  data: IInvestorAppreciationUpdateDTO,
) {
  await getInvestorAppreciationById(id);

  const prismaData = Object.fromEntries(
    Object.entries({
      year: data.year,
      bsp: data.bsp,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.investorAppreciation.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteInvestorAppreciation(id: string) {
  await getInvestorAppreciationById(id);
  return prisma.investorAppreciation.delete({
    where: { id },
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.investorAppreciation.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.investorAppreciation.update({
    where: { id },
    data,
  });
}
