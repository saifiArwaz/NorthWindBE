import { prisma } from "../../config/prisma.config.js";
import {
  ITestimonialCreateDTO,
  ITestimonialUpdateDTO,
} from "./testimonial.interface.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function createTestimonial(data: ITestimonialCreateDTO) {
  let prismaData: any = {
    name: data.name,
    fileType: data.fileType,
    link: data.link,
    description: data.description,
    files: data.files,
    alt: data.alt,
    watermark: data.watermark,
    isFeature: data.isFeature,
    isHome: data.isHome,
    status: data.status,
    createdBy: data.createdBy,
  };
  return prisma.testimonials.create({ data: prismaData });
}

export async function getAllList(
  page = 1,
  limit = 10,
  search = "",
  fileType?: "image" | "video"
) {
  const where: any = {
    ...(search && {
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    }),
    ...(fileType && { fileType }),
  };
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.testimonials,
    {
      where,
      orderBy: { seq: "asc" },
    },
    { page, limit },
  );
}

export async function updateTestimonial(
  id: string,
  data: ITestimonialUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      name: data.name,
      link: data.link,
      fileType: data.fileType,
      description: data.description,
      files: data.files,
      alt: data.alt,
      watermark: data.watermark,
      isFeature: data.isFeature,
      isHome: data.isHome,
      status: data.status,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );

  return prisma.testimonials.update({
    where: { id },
    data: prismaData,
  });
}

export async function getTestimonialById(id: string) {
  return prisma.testimonials.findUnique({
    where: { id },
  });
}

export async function deleteTestimonialById(id: string) {
  return prisma.testimonials.delete({
    where: { id },
  });
}

export async function updateProjectSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.testimonials.update({
    where: { id },
    data,
  });
}

export async function updateTestimonialFeature(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.testimonials.update({
    where: { id },
    data,
  });
}

export async function updateTestimonialHome(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.testimonials.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.testimonials.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
