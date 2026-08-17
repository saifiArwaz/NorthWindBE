import { prisma } from "../../config/prisma.config.js";
import { IJobDTO, IJobUpdateDTO } from "./job.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";

export async function createJob(data: IJobDTO) {
  const prismaData: any = {
    title: data.title,
    jobType: data.jobType,
    location: data.location,
    description: data.description,
    createdBy: data.createdBy,
  };

  return prisma.jobs.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { jobType: { contains: search, mode: "insensitive" } },
    ];
  }

  return paginate(
    prisma.jobs,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getJobById(id: string) {
  return prisma.jobs.findUnique({
    where: { id },
  });
}

export async function updateJob(id: string, data: IJobUpdateDTO) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      jobType: data.jobType,
      location: data.location,
      description: data.description,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.jobs.update({
    where: { id },
    data: prismaData,
  });
}

export async function deleteJob(id: string) {
  return prisma.jobs.delete({
    where: { id },
  });
}

export async function updateJobSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.jobs.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.jobs.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
