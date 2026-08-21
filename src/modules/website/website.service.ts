import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import {
  CityContentDetailTypes,
  csrContentTypes,
  FaqTypes,
  gallerieTypes,
  PartnerType,
  PressType,
} from "../../generated/prisma/enums.js";
import { BUDGET_RANGES } from "../../utils/budget.utils.js";
import { title } from "process";

type GetUnderConstructionProps = {
  year?: string;
  month?: string;
  towerId?: string;
  projectSlug?: string;
};

// new service start here
export async function getPageBySlug(slug: string) {
  const page = await prisma.pages.findUnique({
    where: { slug, status: true, isDeleted: false },
    include: {
      sections: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!page) return null;

  const sectionsObject: Record<string, any> = {};
  if (Array.isArray(page.sections)) {
    for (const section of page.sections) {
      sectionsObject[section.type] = section;
    }
  }

  return {
    ...page,
    sections: sectionsObject,
  };
}

export async function getPageSectionsByType(type: string) {
  return prisma.pageSections.findMany({
    where: {
      type,
      ...(type && { type }),
      isDeleted: false,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getHomeValue() {
  return prisma.values.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "desc" },
  });
}

export async function getAwardsYear() {
  const awards = await prisma.awards.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  // remove duplicates + empty values
  const uniqueYears = [
    ...new Set(awards.map((item) => item.createdAt?.getFullYear()).filter(Boolean)),
  ];

  return uniqueYears;
}
export async function getAwards(
  page: number = 1,
  limit: number = 10,
  filter: any = {},
) {
  const where: any = {
    status: true,
    isDeleted: false,
  };
  if (filter.search) {
    where.title = {
      contains: filter.search,
      mode: "insensitive",
    };
  }
  return paginate(
    prisma.awards,
    {
      where,
      orderBy: { seq: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        files: true,
        alt: true,
        watermark: true,
        status: true,
        seq: true,
      },
    },
    { page, limit },
  );
}

export async function getBlogs(
  page: number = 1,
  limit: number = 10,
  filter: any = {},
) {
  const where: any = {
    status: true,
    isDeleted: false,
  };
  const orderBy: any = {};

  const { search, isLatest, isFeature, isHome } = filter;

  if (isLatest && typeof isLatest === "boolean" && isLatest === true) {
    orderBy.dateAt = "desc";
  } else {
    orderBy.dateAt = "desc";
  }

  if (isHome !== undefined) {
    where.isHome = Boolean(isHome);
  }

  if (isFeature !== undefined) {
    where.isFeature = Boolean(isFeature);
  }

  if (isLatest !== undefined) {
    where.isLatest = Boolean(isLatest);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  return paginate(
    prisma.blogs,
    {
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        dateAt: true,
        description: true,
        files: true,
        alt: true,
        watermark: true,
        seoTags: true,
        isLatest: true,
        isFeature: true,
        isHome: true,
        status: true,
        seq: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    { page, limit },
  );
}

export async function getBlogBySlug(slug: string) {
  return prisma.blogs.findFirst({
    where: {
      slug,
      status: true,
      isDeleted: false,
    },
  });
}
export async function getLatestBlogs(limit = 5) {
  return (prisma as any).blogs.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      files: true,
      dateAt: true,
      createdAt: true,
    },
  });
}

export async function getBlogFaqsByBlogId(blogId: string) {
  return (prisma as any).blogFaq.findMany({
    where: {
      blogId,
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      question: true,
      answer: true,
      seq: true,
      status: true,
    },
  });
}

export async function getRelatedBlogs(
  slug: string,
  page = 1,
  limit = 10,
) {
  const blog = await prisma.blogs.findFirst({
    where: {
      slug,
      status: true,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  return paginate(
    prisma.blogs,
    {
      where: {
        id: {
          not: blog.id,
        },
        status: true,
        isDeleted: false,
      },
      orderBy: {
        dateAt: "desc",
      },
    },
    { page, limit },
  );
}

export async function getBlogsByCategoryId(
  categoryId: string,
  page: number = 1,
  limit: number = 10,
) {
  console.log("categoryId", categoryId);
  return paginate(
    prisma.blogs,
    {
      where: {
        categoryId,
        status: true,
        isDeleted: false,
      },
      orderBy: {
        dateAt: "desc",
      },
    },
    { page, limit },
  );
}

export async function getMediaCoverage(
  filter: { mediaType?: string; isHome?: string },
  page: number = 1,
  limit: number = 10,
) {
  const where: any = {
    status: true,
    isDeleted: false,
  };
  if (filter.mediaType && filter.mediaType.trim() !== "all") {
    where.mediaType = filter.mediaType as PressType;
  }
  if (filter.isHome) {
    where.isHome = Boolean(filter.isHome);
  }

  let orderBy: any = { dateAt: "desc" };
  return paginate(
    prisma.mediaCoverage,
    {
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        mediaType: true,
        dateAt: true,
        description: true,
        files:true,
        link: true,
        status: true,
        seq: true,
        isHome: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    { page, limit },
  );
}

export async function getTeam(isFounder?: string) {
  const where: any = {
    status: true,
    isDeleted: false,
  };
  if (isFounder && typeof isFounder === "string") {
    where.isFounder = isFounder == "true" ? true : false;
  }
  return prisma.team.findMany({
    where,
    orderBy: [{ seq: "asc" }],
    select: {
      id: true,
      name: true,
      designation: true,
      files: true,
      alt: true,
      watermark: true,
      description: true,
      isFounder: true,
      status: true,
      seq: true,
    },
  });
}

export async function getTimelines() {
  const timelines = await prisma.timeline.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: [{ seq: "asc" }],
    select: {
      id: true,
      files: true,
      description: true,
      seq: true,
    },
  });
  return timelines
}

export async function getFaqsByType(type: string) {
  return prisma.faqs.findMany({
    where: {
      status: true,
      isDeleted: false,
      type: type as FaqTypes,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      type: true,
      question: true,
      answer: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


export async function getFaqs(type?: string) {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  if (type) {
    where.type = type as FaqTypes;
  }
  return prisma.faqs.findMany({
    where,
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      type: true,
      question: true,
      answer: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getCsrContentGalleries(type?: string) {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  if (type) {
    where.type = type as csrContentTypes;
  }

  return prisma.csrContentGalleries.findMany({
    where: where,
    orderBy: { seq: "asc" },
    select: {
      id: true,
      type: true,
      files: true,
      alt: true,
      watermark: true,
      status: true,
      seq: true,
    },
  });
}

export async function getCsrContent() {
  return prisma.csrContentDetails.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      title: true,
      files: true,
      alt: true,
      shortDescription: true,
      status: true,
      seq: true,
      watermark: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getGalleriesByType(type: string, fileType?: string) {
  const where: any = {
    status: true,
    isDeleted: false,
    type: type as gallerieTypes,
  };

  if (fileType) {
    where.fileType = fileType;
  }

  return prisma.galleriesList.findMany({
    where,
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      type: true,
      files: true,
      fileType: true,
      alt: true,
      watermark: true,
      status: true,
      seq: true,
    },
  });
}

export async function getUnderConstruction({
  year,
  month,
  towerId,
  projectSlug,
}: GetUnderConstructionProps = {}) {
  let dateFilter: any = undefined;

  if (year) {
    const yr = parseInt(year);
    if (!isNaN(yr)) {
      if (month) {
        const mn = parseInt(month); // 1-12
        if (!isNaN(mn)) {
          const startDate = new Date(yr, mn - 1, 1);
          const endDate = new Date(yr, mn, 0, 23, 59, 59, 999);
          dateFilter = { gte: startDate, lte: endDate };
        }
      } else {
        const startDate = new Date(yr, 0, 1);
        const endDate = new Date(yr, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: startDate, lte: endDate };
      }
    }
  }

  const whereCondition = {
    status: true,
    isDeleted: false,

    ...(projectSlug && {
      project: {
        slug: projectSlug,
      },
    }),
    ...(towerId && { towerId }),
    ...(dateFilter && { dateAt: dateFilter }),
  };

  const [galleries, metadataRecords] = (await Promise.all([
    // Gallery Data
    prisma.constructionGalleries.findMany({
      where: whereCondition,

      orderBy: {
        seq: "asc",
      },

      select: {
        id: true,
        fileType: true,
        files: true,
        alt: true,
        watermark: true,
        link: true,
        isFeature: true,
        status: true,
        seq: true,
        project: {
          select: {
            id: true,
            projectName: true,
            slug: true,
          },
        },
      },
    }),

    // Get all records to extract distinct years, months, and towers
    prisma.constructionGalleries.findMany({
      where: {
        status: true,
        isDeleted: false,
        ...(projectSlug && {
          project: {
            slug: projectSlug,
          },
        }),
      },
      select: {
        dateAt: true,
        project: {
          select: {
            id: true,
            projectName: true,
            slug: true,
          },
        },
        tower: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ])) as [any, any];

  const yearsSet = new Set<number>();
  const monthsSet = new Set<number>();
  const towersMap = new Map<string, any>();
  const projectsMap = new Map<string, any>();

  for (const record of metadataRecords) {
    if (record.dateAt) {
      yearsSet.add(new Date(record.dateAt).getFullYear());
      monthsSet.add(new Date(record.dateAt).getMonth() + 1);
    }
    if (record.tower) {
      towersMap.set(record.tower.id, record.tower);
    }
    if (record.project) {
      projectsMap.set(record.project.id, record.project);
    }
  }

  return {
    galleries,

    filters: {
      projects: Array.from(projectsMap.values()),
      years: Array.from(yearsSet).sort((a, b) => b - a),
      months: Array.from(monthsSet).sort((a, b) => a - b),
      towers: Array.from(towersMap.values()),
    },
  };
}

export async function getMediakit() {
  return prisma.mediaKit.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      logo: true,
      alt: true,
      title: true,
      link: true,
      watermark: true,
      listKit: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getSocialLinks() {
  return prisma.socialLinks.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      key: true,
      socialLink: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getTestimonials(
  filter: { type?: string; fileType?: string; isFeature?: boolean; isHome?: boolean } = {},
) {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  if (filter.type) {
    where.type = filter.type;
  }
  if (filter.fileType) {
    where.fileType = filter.fileType;
  }

  if (filter.isFeature !== undefined) {
    where.isFeature = Boolean(filter.isFeature);
  }

  if (filter.isHome !== undefined) {
    where.isHome = Boolean(filter.isHome);
  }

  return prisma.testimonials.findMany({
    where,
    orderBy: { seq: "asc" },
    select: {
      id: true,
      fileType: true,
      name: true,
      files: true,
      alt: true,
      watermark: true,
      link: true,
      description: true,
      isFeature: true,
      isHome: true,
      seq: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getBlogsCategories() {
  const categories = await prisma.blogCategories.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return categories.map((category) => ({
    ...category,
    blogCount: 0,
  }));
}

export async function getHomeLoan() {
  const where: any = {
    status: true,
    isDeleted: false,
  };
  return prisma.homeLoan.findMany({
    where,
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      files: true,
      name: true,
      alt: true,
      watermark: true,
      seq: true,
      status: true,
    },
  });
}

export async function getHomeLoanAssistance(){
  const where : any = {
    status: true,
    isDeleted: false,
  }
  return prisma.homeLoanAssistance.findMany({
    where,
    orderBy: {
      seq: "asc"
    },
    select:{
      id: true,
      title:true,
      files: true,
      alt: true,
      watermark: true,
      seq: true,
      status: true,
    }
  })
}

export async function getPartners() {
  return prisma.partner.findMany({
    where: {
      status: true,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      title: true,
      link: true,
      files: true,
      alt: true,
      watermark: true,
      status: true,
      seq: true,
    },
  });
}

export async function getEvents(page = 1, limit = 10, eventSlug?: string) {
  const where: any = { status: true, isDeleted: false };
  if (eventSlug) {
    where.slug = eventSlug;
  }

  const eventsResult = await paginate(
    prisma.event,
    {
      where,
      orderBy: { seq: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        seq: true,
        status: true,
        categories: {
          where: { status: true, isDeleted: false },
          orderBy: { seq: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            files: true,
            seq: true,
            status: true,
          },
        },
        galleries: {
          where: { status: true, isDeleted: false },
          orderBy: { seq: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            files: true,
            alt: true,
            watermark: true,
            fileType: true,
            seq: true,
            status: true,
          },
        },
      },
    },
    { page, limit }
  );

  // Clean up responses based on event type
  eventsResult.data = eventsResult.data.map((event: any) => {
    if (event.type === 'album') {
      delete event.galleries;
    } else if (event.type === 'gallery') {
      delete event.categories;
    }
    return event;
  });

  return eventsResult;
}

export async function getCategoryGalleries(slug: string, page = 1, limit = 10) {
  const category = await prisma.eventCategory.findFirst({
    where: { slug, status: true, isDeleted: false },
    select: {
      id: true,
      name: true,
      slug: true,
      files: true,
      seq: true,
      status: true,
    }
  });

  if (!category) return null;

  const galleriesResult = await paginate(
    prisma.eventGalleries,
    {
      where: { categoryId: category.id, status: true, isDeleted: false },
      orderBy: { seq: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        files: true,
        alt: true,
        watermark: true,
        fileType: true,
        seq: true,
        status: true,
      }
    },
    { page, limit }
  );

  return {
    category,
    galleries: galleriesResult.data,
    pagination: galleriesResult.pagination
  };
}

export async function getFeaturedGalleries(page = 1, limit = 10) {
  return paginate(
    prisma.eventGalleries,
    {
      where: { isFeature: true, status: true, isDeleted: false },
      orderBy: { seq: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        files: true,
        alt: true,
        watermark: true,
        fileType: true,
        seq: true,
        status: true,
      }
    },
    { page, limit }
  );
}

export async function getBrands() {
  return prisma.brands.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      files: true,
      alt: true,
      seq: true,
      status: true,
    },
  });
}

export async function getNriWhyUs() {
  return prisma.nriWhy.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      title: true,
      files: true,
      alt: true,
      watermark: true,
      shortDescription: true,
      tags: true,
      seq: true,
      status: true,
    },
  });
}

export async function getInvestorTabs() {
  return prisma.inverstorTabs.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      files: true,
      alt: true,
      seq: true,
      status: true,
    },
  });
}

export async function getInvestorDocuments() {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  return prisma.investorDocuments.findMany({
    where,
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      title: true,
      type: true,
      dateAt: true,
      files: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getJobs(
  page: number = 1,
  limit: number = 10,
  filters: {
    jobType?: string;
    search?: string;
  } = {},
) {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  if (filters.jobType) {
    where.jobType = {
      equals: filters.jobType,
      mode: "insensitive",
    };
  }
  if (filters.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        jobType: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.jobs,
    {
      where,
      orderBy: { seq: "asc" },
      select: {
        id: true,
        title: true,
        jobType: true,
        location: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        seq: true,
      },
    },
    { page, limit },
  );
}

export async function getContetByType(type: string, query: any = {}) {
  return prisma.contentByTypes.findMany({
    where: {
      status: true,
      isDeleted: false,
      type: {
        equals: type,
        mode: "insensitive",
      },
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      description: true,
      files: true,
      alt: true,
      seq: true,
      status: true,
    },
  });
}

// ---------------- START MICROSITE ------------------------
export async function getPlatters() {
  const where: any = {
    status: true,
    isDeleted: false,
  };

  return prisma.platter.findMany({
    where,
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      title: true,
      description: true,
      files: true,
      alt: true,
      watermark: true,
      seq: true,
      status: true,
      seoTags: true,
    },
  });
}

export async function getPlatterBySlug(platterSlug: string) {
  const where: any = {
    status: true,
    isDeleted: false,
    slug: platterSlug,
  };

  const platter = await prisma.platter.findFirst({
    where,

    select: {
      id: true,
      name: true,
      slug: true,
      title: true,
      description: true,
      watermark: true,
      files: true,
      alt: true,
      seq: true,
      status: true,
      seoTags: true,
    },
  });

  return platter;
}

export async function getCities(citySlug: string) {
  const cities = await prisma.city.findFirst({
    where: {
      status: true,
      isDeleted: false,
      slug: citySlug,
      projects: {
        some: {},
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTags: true,
      status: true,
    },
  });

  return cities;
}

export async function getCitiesEcosystemLifestyle(type: string) {
  const data = await prisma.cityEcosystemLifestyle.findMany({
    where: {
      isDeleted: false,
      type: type as CityContentDetailTypes,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      type: true,
      heading: true,
      shortDescription: true,
      files: true,
      alt: true,
      watermark: true,
      status: true,
      seq: true,
    },
  });
  return data;
}

export async function getProjectSubTypology() {
  const records = await prisma.projectSubTypology.findMany({
    select: {
      subTypology: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  return records.map((item) => item.subTypology);
}

// filter services

export async function getFilterBudget() {
  const budgets = [];

  for (const range of BUDGET_RANGES) {
    const count = await prisma.projects.count({
      where: {
        status: true,
        // price: {
        //   gte: Number(range.min),
        //   ...(range.max !== null ? { lte: Number(range.max) } : {}),
        // },
      },
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

  return budgets;
}

export async function getFilterPlatter() {
  return prisma.platter.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getFilterProjectsWithGallery() {
  return prisma.projects.findMany({
    where: {
      status: true,
      isDeleted: false,
      projectGallery: {
        some: {
          status: true,
          isDeleted: false,
        },
      },
    },
    orderBy: {
      projectName: "asc",
    },
    select: {
      id: true,
      projectName: true,
      slug: true,
    },
  });
}


export async function getLocations() {
  return prisma.city.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getFilterSubTypology() {
  return prisma.subTypology.findMany({
    where: {
      projectSubTypologies: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  });
}

export async function getFilterProjectStatus() {
  return prisma.projectStatus.findMany({
    where: {
      status: true,
      projects: {
        some: { status: true },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getFilterJobs() {
  const jobs = await prisma.jobs.findMany({
    where: {
      status: true,
      isDeleted: false,
    },
    select: {
      jobType: true,
      title: true,
      location: true,
    },
  });

  const jobTypes = [
    ...new Set(jobs.map((j) => j.jobType).filter(Boolean)),
  ].sort();
  const titles = [...new Set(jobs.map((j) => j.title).filter(Boolean))].sort();

  return {
    jobTypes,
    titles,
  };
}

export async function getFilterTowers(projectId: string) {
  return prisma.projectTower.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      title:true,
    },
    orderBy: { seq: "asc" },
  });
}

// ---------------------------- new service end here ----------------------------

export async function getInstagramReelsForWebsite() {
  return prisma.instagramReel.findMany({
    where: {
      isDisplay: true,
    },
    orderBy: { seq: "asc" },
  });
}

export async function getCareerGalleries(page: number = 1, limit: number = 10) {
  return paginate(
    prisma.careerGallery,
    {
      where: {
        status: true,
      },
      orderBy: { seq: "asc" },
      select: {
        id: true,
        files: true,
        alt: true,
        status: true,
        seq: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    { page, limit },
  );
}

export async function getSubTypologyByTypologySlug(typologySlug: string) {
  // Find the typology by slug
  const typology = await prisma.typology.findUnique({
    where: { slug: typologySlug },
    select: { id: true },
  });

  if (!typology) {
    return [];
  }

  return prisma.subTypology.findMany({
    where: {
      mappings: {
        some: {
          typologyId: typology.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getFeatureProjects(limit: number = 6) {
  return prisma.projects.findMany({
    where: {
      isFeature: true,
      status: true,
    },
    take: limit,
    orderBy: { seq: "asc" },
    select: {
      id: true,
      slug: true,
      projectName: true,
      location: true,
      isFeature: true,
      isPage: true,
      status: true,
      seq: true,
      alt: true,
      files: true,
      otherDetails: true,
      createdAt: true,
      updatedAt: true,
      projectBanner: {
        where: { isBanner: false },
        orderBy: { seq: "asc" },
        select: {
          id: true,
          isBanner: true,
          files: true,
          alt: true,
          watermark: true,
          seq: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      platter: {
        select: {
          id: true,
          name: true,
          slug: true,
          title: true,
        },
      },
      typology: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      projectStatus: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });
}

export async function getProjectsByPlatterSlug(
  platterSlug: string,
  filters: {
    typologySlugs?: string[];
    subTypologySlugs?: string[];
    citySlug?: string[];
    projectStatusSlugs?: string[];
    developerSlug?: string;
    search?: string; // Add search filter
  } = {},
  page: number = 1,
  limit: number = 10,
) {
  // Build where clause
  const where: any = {
    platter: {
      slug: platterSlug,
    },
    status: true,
  };

  // Apply typology filter (multiple)
  if (filters.typologySlugs && filters.typologySlugs.length > 0) {
    where.typology = {
      slug: {
        in: filters.typologySlugs,
      },
    };
  }

  // Apply subtypology filter (multiple)
  if (filters.subTypologySlugs && filters.subTypologySlugs.length > 0) {
    where.subTypology = {
      slug: {
        in: filters.subTypologySlugs,
      },
    };
  }

  // Apply city filter
  if (filters.citySlug && filters.citySlug.length > 0) {
    where.city = {
      slug: {
        in: filters.citySlug,
      },
    };
  }

  // Apply project status filter
  if (filters.projectStatusSlugs) {
    where.projectStatus = {
      slug: {
        in: filters.projectStatusSlugs,
      },
    };
  }

  // Apply developer filter
  if (filters.developerSlug) {
    where.developer = {
      slug: filters.developerSlug,
    };
  }

  // Add search by projectName or location if provided
  if (filters.search && filters.search.trim() !== "") {
    // Append search logic to the where clause (case-insensitive contains)
    where.OR = [
      {
        projectName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return paginate(
    prisma.projects,
    {
      where,
      orderBy: [{ seq: "asc" }, { id: "asc" }],
      select: {
        id: true,
        projectName: true,
        slug: true,
        files: true,
        location: true,
        otherDetails: true,
        isPage: true,
        is_featured: true,
        status: true,
        seq: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        platter: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
        projectStatus: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        projectBanner: {
          where: {
            isBanner: false,
          },
          select: {
            id: true,
            files: true,
            status: true,
            seq: true,
            isBanner: true,
            alt: true,
          },
          take: 3,
        },
      },
    },
    { page, limit },
  );
}

export async function getProjectGalleriesByProjectId(
  projectId: string,
  types?: string[],
  fileTypes?: string[],
) {
  return prisma.projectGallery.findMany({
    where: {
      projectId,
      status: true,
      ...(fileTypes && fileTypes.length > 0
        ? { fileType: { in: fileTypes as any[] } }
        : {}),
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      fileType: true,
      files: true,
      alt: true,
      link: true,
      seq: true,
    },
  });
}

export async function getProjectsNameAndSlug(
  platter?: string,
  search?: string,
) {
  return prisma.projects.findMany({
    where: {
      status: true,
      isPage: true,
      ...(platter
        ? {
          platter: {
            slug: platter,
          },
        }
        : {}),
      ...(search
        ? {
          projectName: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {}),
    },
    select: {
      projectName: true,
      slug: true,
      isPage: true,
      platter: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { projectName: "asc" },
  });
}

export async function getOfficesLocation() {
  return prisma.officesLocation.findMany({
    where: {
      status: true,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      city: true,
      officeName: true,
      list: true,
      status: true,
      seq: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getNews(page: number = 1, limit: number = 10) {
  return paginate(
    prisma.news,
    {
      where: {
        status: true,
      },
      orderBy: {
        dateAt: "desc",
      },
      select: {
        id: true,
        title: true,
        newsLink: true,
        watermark: true,
        dateAt: true,
        status: true,
        seq: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    { page, limit },
  );
}

export async function getProjectsByPlatterWithGallery(platter: string) {
  const platterEntity = await prisma.platter.findFirst({
    where: {
      OR: [{ slug: platter }, { id: platter }],
      status: true,
    },
    select: { id: true },
  });

  if (!platterEntity) return [];

  const projects = await prisma.projects.findMany({
    where: {
      platterId: platterEntity.id,
      status: true,
      projectGallery: {
        some: { status: true },
      },
    },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      slug: true,
      projectName: true,
    },
  });

  return projects;
}

export async function getPlatterForEnquiry() {
  const where: any = {
    status: true,
  };

  return prisma.platter.findMany({
    where,
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seq: true,
      status: true,
    },
  });
}

export async function getProjectLocationByPlatter(platterSlug: string) {
  const projects = await prisma.projects.findMany({
    where: {
      platter: {
        slug: platterSlug,
        status: true,
      },
      status: true,
      city: {
        status: true,
      },
    },
    select: {
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    distinct: ["cityId"],
  });

  const uniqueCities = projects.map((p) => p.city).filter((c) => !!c);

  return uniqueCities;
}

export async function getProjectsByCity(citySlug: string) {
  const projects = await prisma.projects.findMany({
    where: {
      city: {
        slug: citySlug,
        status: true,
      },
      status: true,
    },
    select: {
      id: true,
      projectName: true,
      slug: true,
      platter: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      projectName: "asc",
    },
  });

  return projects;
}

// Job Application Enquiry Service
export async function createJobApplication(data: {
  jobId?: string;
  fullName: string;
  emailAddress: string;
  phoneNo: string;
  message?: string;
  resume: string;
}) {
  const jobApplication = await prisma.jobApplication.create({
    data: {
      ...data,
      jobId: data.jobId || undefined,
    },
    include: {
      jobs: true,
    },
  });
  return jobApplication;
}

// Post Your Request Enquiry Service
export async function createNewsLetterEnquiry(data: { emailAddress: string }) {
  const newsletter = await prisma.newsLetterEnquiry.create({
    data: {
      ...data,
    },
  });
  return newsletter;
}

export async function createContactEnquiry(data: {
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  query?: string;
}) {
  const projectEnquiry = await prisma.contactEnquiry.create({
    data: {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      query: data.query || null,
    },
  });
  return projectEnquiry;
}

export async function createProjectEnquiry(data: {
  projectId?: string;
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  query?: string;
  campaignCode?: string;
  remarks?: string;
  AgencyName?: string;
  utmcampaign?: string;
  utmcontent?: string;
  utmmedium?: string;
  utmsource?: string;
}) {
  const projectEnquiry = await prisma.projectEnquiry.create({
    data: {
      projectId: data.projectId || null,
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      query: data.query || null,
      campaignCode: data.campaignCode || null,
      remarks: data.remarks || null,
      AgencyName: data.AgencyName || null,
      utmcampaign: data.utmcampaign || null,
      utmcontent: data.utmcontent || null,
      utmmedium: data.utmmedium || null,
      utmsource: data.utmsource || null,
    },
  });
  return projectEnquiry;
}

export async function createOrangeCircleEnquiry(data: {
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  companyName?: string;
  role?: string;
  affiliation?: string;
  contactNo?: string;
  query?: string;
  campaignCode?: string;
  remarks?: string;
  AgencyName?: string;
  utmcampaign?: string;
  utmcontent?: string;
  utmmedium?: string;
  utmsource?: string;
}) {
  const projectEnquiry = await prisma.orangeCircleEnquiry.create({
    data: {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      companyName: data.companyName || null,
      role: data.role || null,
      affiliation: data.affiliation || null,
      contactNo: data.contactNo || null,
      query: data.query || null,
      campaignCode: data.campaignCode || null,
      remarks: data.remarks || null,
      AgencyName: data.AgencyName || null,
      utmcampaign: data.utmcampaign || null,
      utmcontent: data.utmcontent || null,
      utmmedium: data.utmmedium || null,
      utmsource: data.utmsource || null,
    },
  });
  return projectEnquiry;
}

export async function createChannelPartnerEnquiry(data: {
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  companyName?: string;
  experience?: string;
  agencyName: string;
  location: string;
  reraCertifiedNo?: string;
  query?: string;
}) {
  const channelPartnerEnquiry = await prisma.channelPartnerEnquiry.create({
    data: {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      companyName: data.companyName,
      experience: data.experience,
      agencyName: data.agencyName,
      location: data.location,
      reraCertifiedNo: data.reraCertifiedNo,
      message: data.query,
    },
  });
  return channelPartnerEnquiry;
}

export async function getSiteMap() {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      parentId: null,
    },
    select: {
      id: true,
      label: true,
      seq: true,
      page: {
        select: {
          id: true,
          pageName: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          label: true,
          seq: true,
          page: {
            select: {
              id: true,
              pageName: true,
              slug: true,
            },
          },
        },
        orderBy: {
          seq: "asc",
        },
      },
    },
    orderBy: {
      seq: "asc",
    },
  });

  const siteMap = menuItems.map((item) => ({
    id: item.id,
    label: item.label,
    page: item.page,
    children: (item.children || []).map((child) => ({
      id: child.id,
      label: child.label,
      page: child.page,
    })),
  }));

  return siteMap;
}

export async function getProjectForSitemapByStatus() {
  const platters = await prisma.platter.findMany({
    where: { status: true },
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seq: true,
    },
  });

  const result: any[] = [];

  for (const platter of platters) {
    const statuses = await prisma.projectStatus.findMany({
      where: {
        status: true,
        projects: {
          some: {
            platterId: platter.id,
            status: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        projects: {
          where: {
            platterId: platter.id,
            status: true,
          },
          orderBy: { seq: "asc" },
          select: {
            id: true,
            projectName: true,
            slug: true,
            isPage: true,
            city: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            platter: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            status: true,
            seq: true,
          },
        },
      },
    });

    // 👉 Group projects by city
    const formattedStatuses = statuses.map((status) => {
      const cityMap: Record<string, any> = {};

      for (const project of status.projects) {
        const cityId = project.city?.id;

        if (!cityId) continue;

        if (!cityMap[cityId]) {
          cityMap[cityId] = {
            city: project.city,
            projects: [],
          };
        }

        cityMap[cityId].projects.push(project);
      }

      return {
        id: status.id,
        name: status.name,
        slug: status.slug,
        status: status.status,
        cities: Object.values(cityMap), // 👈 grouped cities
      };
    });

    result.push({
      platter,
      statuses: formattedStatuses,
    });
  }

  return result;
}
