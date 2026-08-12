import { prisma } from "../../config/prisma.config.js";
import {
  ICitySectionListCreateDTO,
  ICitySectionListUpdateDTO,
} from "./citiesSection.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { CitySectionTypes } from "../../generated/prisma/enums.js";

export async function createCitiesSection(data: ICitySectionListCreateDTO) {
  return prisma.citySections.create({
    data: {
      sectionType: data.sectionType as CitySectionTypes,
      title: data.title,
      alt: data.alt,
      description: data.description,
      files: data.files,
      list: data.list,
      cityId: data.cityId,
      ...(data.createdBy
        ? { creator: { connect: { id: data.createdBy } } }
        : {}),
      ...(data.updatedBy
        ? { updatedUser: { connect: { id: data.updatedBy } } }
        : {}),
    },
  });
}

export async function getAllCitiesSection(
  projectId = "",
  page = 1,
  limit = 10,
  search = "",
) {
  const where: any = {
    ...(projectId ? { projectId } : {}),
  };
  if (search) {
    where.OR = [
      { pageName: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { heading: { contains: search, mode: "insensitive" } },
    ];
  }
  if (typeof where !== "undefined" && where && typeof where === "object") {
    (where as any).isDeleted = false;
  }
  return paginate(
    prisma.citySections,
    {
      where,
      orderBy: { createdAt: "desc" },
    },
    { page, limit },
  );
}

export async function getAllCitiesSectionList() {
  return prisma.citySectionLists.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCitiesSectionById(id: string) {
  return prisma.citySections.findUnique({
    where: { id },
  });
}

export async function updateCitiesSection(
  id: string,
  data: ICitySectionListUpdateDTO,
) {
  const prismaData = Object.fromEntries(
    Object.entries({
      title: data.title,
      files: data.files,
      alt: data.alt,
      description: data.description,
      list: data.list,
      ...(data.updatedBy && {
        updatedUser: { connect: { id: data.updatedBy } },
      }),
    }).filter(([_, v]) => v !== undefined),
  );
  const section = await prisma.citySections.update({
    where: { id },
    data: prismaData,
  });

  return section;
}

export async function deleteCitiesSection(id: string) {
  return prisma.citySections.delete({
    where: { id },
  });
}

export async function getCitiesSectionBySectionType(
  cityId: string,
  sectionType: any,
) {
  return prisma.citySections.findFirst({
    where: {
      cityId: cityId,
      sectionType,
    },
  });
}

export async function updateSeq(id: string, payload: any) {
  let data: any = { ...payload };
  if (payload.updatedBy) {
    data.updatedUser = { connect: { id: payload.updatedBy } };
    delete data.updatedBy;
  }
  return prisma.citySectionLists.update({
    where: { id },
    data,
  });
}

export async function updateStatus(
  id: string,
  status: boolean,
  updatedBy?: string,
) {
  return prisma.citySections.update({
    where: { id },
    data: {
      status,
      ...(updatedBy && {
        updatedUser: { connect: { id: updatedBy } },
      }),
    },
  });
}
