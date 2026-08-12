import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ENQUIRY_FLOW_BUDGET_RANGES } from "./enquiry-flow.budget.js";

export type LocationType = "city" | "locality";

export interface EnquiryFlowFilterParams {
  platterSlug: string;
  locationSlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function buildEnquiryFlowProjectWhere({
  platterSlug,
  localitySlug,
  minPrice,
  maxPrice,
}: {
  platterSlug: string;
  localitySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return {
    platter: {
      slug: platterSlug,
    },

    ...(localitySlug && {
      locality: {
        slug: localitySlug,
      },
    }),

    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        }
      : {}),
  };
}

export async function getEnquiryFlowPlatters() {
  return prisma.platter.findMany({
    where: {
      status: true,
      projects: { some: { status: true } },
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seq: true,
    },
  });
}

export async function getEnquiryFlowLocations(platterSlug: string) {
  const baseWhere = buildEnquiryFlowProjectWhere({ platterSlug });

  const projects = await prisma.projects.findMany({
    where: baseWhere,
    // select: {
    //   localityId: true,
    //   locality: {
    //     select: { id: true, name: true, slug: true },
    //   },
    // },
  });

  const localityMap = new Map<
    string,
    {
      type: "locality";
      id: string;
      name: string;
      slug: string;
      projectCount: number;
    }
  >();

  // for (const project of projects) {
  //   if (project.locality) {
  //     const existing = localityMap.get(project.locality.id);

  //     if (existing) {
  //       existing.projectCount += 1;
  //     } else {
  //       localityMap.set(project.locality.id, {
  //         type: "locality",
  //         id: project.locality.id,
  //         name: project.locality.name,
  //         slug: project.locality.slug,
  //         projectCount: 1,
  //       });
  //     }
  //   }
  // }

  const locations = Array.from(localityMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return { platterSlug, locations };
}

export async function getEnquiryFlowBudgets(
  platterSlug: string,
  locationSlug?: string,
) {
  const filter: EnquiryFlowFilterParams = { platterSlug, locationSlug };

  const budgets = [];

  for (const range of ENQUIRY_FLOW_BUDGET_RANGES) {
    const count = await prisma.projects.count({
      where: buildEnquiryFlowProjectWhere({
        ...filter,
        minPrice: range.min,
        maxPrice: range.max,
      }),
    });

    if (count > 0) {
      budgets.push({
        key: range.key,
        label: range.label,
        min: range.min,
        max: range.max,
        count,
      });
    }
  }

  return { platterSlug, locationSlug, budgets };
}

const projectListSelect = {
  id: true,
  slug: true,
  projectName: true,
  price: true,
  location: true,
  files: true,
  alt: true,
  platter: {
    select: { id: true, name: true, slug: true },
  },
  locality: {
    select: { id: true, name: true, slug: true },
  },
} as const;

export async function getEnquiryFlowProjects(
  platterSlug: string,
  localitySlug: string,
  minPrice: number,
  maxPrice: number,
  page = 1,
  limit = 10,
) {
  const where = buildEnquiryFlowProjectWhere({
    platterSlug,
    localitySlug,
    minPrice,
    maxPrice,
  });

  const result = await paginate(
    prisma.projects,
    {
      where,
      orderBy: { seq: "asc" },
      select: projectListSelect,
    },
    { page, limit },
  );

  return result;
}
