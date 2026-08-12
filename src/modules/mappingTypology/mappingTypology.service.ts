import { prisma } from "../../config/prisma.config.js";
import {
  IMmappingSubTypologyDTO,
  ISubTypologyUpdateDTO,
} from "./mappingTypology.interface.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import slugifyPkg from "slugify";
const slugify = (slugifyPkg as any).default ?? slugifyPkg;

export async function createMappingTypology(data: IMmappingSubTypologyDTO) {
  const typology = await prisma.typology.findFirst({
    where: { id: data.typologyId },
  });
  const subTypology = await prisma.subTypology.findFirst({
    where: { id: data.subTypologyId },
  });
  if (!typology || !subTypology) throw new ApiError(404, "Record not found");

  const existingMapping = await prisma.typologySubTypology.findFirst({
    where: {
      typologyId: data.typologyId,
      subTypologyId: data.subTypologyId,
    },
  });
  if (existingMapping) {
    throw new ApiError(
      409,
      "This mapping between Typology and SubTypology already exists",
    );
  }

  let prismaData: any = {
    typology: { connect: { id: data.typologyId } },
    subTypology: { connect: { id: data.subTypologyId } },
    ...(data.createdBy ? { creator: { connect: { id: data.createdBy } } } : {}),
  };
  return prisma.typologySubTypology.create({ data: prismaData });
}

export async function getAllList(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [
          {
            typology: {
              name: { contains: search, mode: "insensitive" },
            },
          },
          {
            subTypology: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }
    : {};

  return paginate(
    prisma.typologySubTypology,
    {
      where,
      orderBy: { createdAt: "desc" },
      include: {
        typology: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subTypology: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    { page, limit },
  );
}

// export async function updateSubTypology(id: string, data: ISubTypologyUpdateDTO) {

//      let prismaData: any = {
//           typologyId:  data.typologyId,
//           subTypologyId:  data.subTypologyId,
//           ...(data.updatedBy ? { updatedUser: { connect: { id: data.updatedBy } } } : {}),
//      };

//      return prisma.typologySubTypology.update({
//           where: { id },
//           data: prismaData
//      });
// }

export async function getSubTypologyById(id: string) {
  return prisma.typologySubTypology.findUnique({
    where: { id },
  });
}

export async function deleteSubTypology(id: string) {
  return prisma.typologySubTypology.delete({ where: { id } });
}

export async function getSubTypesForTypology(typologyId: string) {
  const rows = await prisma.typologySubTypology.findMany({
    where: { typologyId },
    include: { subTypology: true },
  });

  return rows.map((r) => r.subTypology);
}

export async function getUnassignedSubTypes(typologyId: string) {
  const assigned = await prisma.typologySubTypology.findMany({
    where: {
      typologyId,
      subTypology: {
        isDeleted: false,
      },
    },
    select: {
      subTypologyId: true,
    },
  });

  const assignedIds = assigned.map((x) => x.subTypologyId);
  return prisma.subTypology.findMany({
    where: {
      isDeleted: false,
      id: {
        notIn: assignedIds,
      },
    },
  });
}

export async function removeAssignedSubType(
  typologyId: string,
  subTypologyId: string,
) {
  const existingMapping = await prisma.typologySubTypology.findFirst({
    where: {
      typologyId: typologyId,
      subTypologyId: subTypologyId,
    },
  });
  if (!existingMapping) throw new ApiError(404, "Record not found");

  return prisma.typologySubTypology.deleteMany({
    where: {
      typologyId,
      subTypologyId,
    },
  });
}

export async function getTypologyById(id: string) {
  return prisma.typology.findUnique({
    where: { id },
  });
}
