import { prisma } from "../../config/prisma.config.js";
import {
  IProjectFaqDTO,
  IProjectFaqUpdateDTO,
} from "./projectFaq.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ProjectFloorPlanTypes } from "../../generated/prisma/enums.js";

export async function createProjectFaq(data: IProjectFaqDTO) {
  let prismaData: any = {
    projectId: data.projectId,
    question: data.question,
    answer: data.answer,
    createdBy: data.createdBy,
  };
  return prisma.projectFaq.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  projectId: string,
  type: string,
) {
  let where: any = {
    projectId,
  };
  if (type) {
    where.type = type as ProjectFloorPlanTypes;
  }

  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.projectFaq,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateProjectFaq(id: string, data: IProjectFaqUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      question: data.question,
      answer: data.answer,
      updatedBy: data.updatedBy,
    }).filter(([_, v]) => v !== undefined),
  );
  return prisma.projectFaq.update({
    where: { id },
    data: prismaData,
  });
}

export async function getProjectFaqById(id: string) {
  return prisma.projectFaq.findUnique({
    where: { id },
  });
}

export async function deleteProjectFaq(id: string) {
  return prisma.projectFaq.delete({
    where: { id },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.projectFaq.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.projectFaq.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
