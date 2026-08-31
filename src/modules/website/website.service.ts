import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";
import {
  FaqTypes,
  gallerieTypes,
  PressType,
} from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";
import { sendEmail } from "../../utils/email.utils.js";
const { sendSms, sendVerifyOtp, checkVerifyOtp } = await import("../../utils/twilio.utils.js");

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

  const { search, isLatest, isFeature, isHome } = filter;

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
      orderBy: {
        dateAt: "desc",
      },
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
      dateAt: "desc",
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
        files: true,
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
      link: true,
      alt: true,
      watermark: true,
      status: true,
      seq: true,
    },
  });
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
      type: true,
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

export async function getHomeLoanAssistance() {
  const where: any = {
    status: true,
    isDeleted: false,
  }
  return prisma.homeLoanAssistance.findMany({
    where,
    orderBy: {
      seq: "asc"
    },
    select: {
      id: true,
      title: true,
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
            events: {
              where: { status: true, isDeleted: false },
              orderBy: { seq: "asc" },
              select: {
                id: true,
                title: true,
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
        galleries: {
          where: { categoryId: null, status: true, isDeleted: false },
          orderBy: { seq: "asc" },
          select: {
            id: true,
            title: true,
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

  // Map category events to galleries for the frontend
  eventsResult.data = eventsResult.data.map((event: any) => {
    if (event.categories) {
      event.categories = event.categories.map((cat: any) => {
        cat.galleries = cat.events;
        delete cat.events;
        return cat;
      });
    }
    return event;
  });

  return eventsResult;
}

export async function getCategoryGalleries(eventSlug: string, categorySlug: string, page = 1, limit = 10) {
  const event = await prisma.event.findFirst({
    where: { slug: eventSlug, status: true, isDeleted: false },
    select: { id: true, title: true, slug: true }
  });

  if (!event) return null;

  const category = await prisma.eventCategory.findFirst({
    where: { slug: categorySlug, eventId: event.id, status: true, isDeleted: false },
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
    event,
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
      watermark: true,
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
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seq: true,
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
    orderBy: { seq: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      seq: true,
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
      title: true,
    },
    orderBy: { seq: "asc" },
  });
}

export async function getFilterConstructionYears(projectId: string) {
  const galleries = await prisma.constructionGalleries.findMany({
    where: {
      projectId,
      status: true,
      isDeleted: false,
    },
    select: {
      dateAt: true,
    },
  });

  const years = new Set<number>();
  galleries.forEach((g) => {
    if (g.dateAt) {
      years.add(new Date(g.dateAt).getUTCFullYear());
    }
  });

  return Array.from(years).sort((a, b) => b - a);
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
  location?: string;
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
  location?: string;
  pageUrl?: string;
}) {
  const projectEnquiry = await prisma.contactEnquiry.create({
    data: {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      query: data.query || null,
      pageUrl: data.pageUrl || null,
      location: data.location || null,
    }
  });
  return projectEnquiry;
}

export async function sendSmsOtp(mobileNo: string) {
  if (process.env.TWILIO_VERIFY_SERVICE_SID) {
    await sendVerifyOtp(mobileNo);
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  const existingOtp = await prisma.otpVerification.findFirst({
    where: { mobileNo },
  });

  if (existingOtp) {
    await prisma.otpVerification.update({
      where: { id: existingOtp.id },
      data: { otp, expiresAt, isVerified: false },
    });
  } else {
    await prisma.otpVerification.create({
      data: { mobileNo, otp, expiresAt },
    });
  }

  await sendSms(mobileNo, `Your verification code is: ${otp}`);
}

export async function sendFloorplanTowerOtp(emailAddress: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  const existingOtp = await prisma.otpVerification.findFirst({
    where: { emailAddress },
  });

  if (existingOtp) {
    await prisma.otpVerification.update({
      where: { id: existingOtp.id },
      data: { otp, expiresAt, isVerified: false },
    });
  } else {
    await prisma.otpVerification.create({
      data: { emailAddress, otp, expiresAt },
    });
  }

  await sendEmail(emailAddress, "Your Verification OTP", "otp-email", { otp });
}

export async function createFloorplanTowerEnquiry(data: {
  projectId?: string;
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  message?: string;
}) {
  const enquiry = await prisma.floorplanTowerEnquiry.create({
    data: {
      projectId: data.projectId || null,
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      message: data.message || null,
      isVerified: false,
    },
    include: {
      projects: true
    }
  });

  return enquiry;
}

export async function verifySmsOtp(data: { mobileNo: string; otp: string }) {
  if (process.env.TWILIO_VERIFY_SERVICE_SID) {
    const isApproved = await checkVerifyOtp(data.mobileNo, data.otp);
    if (!isApproved) {
      throw new ApiError(400, "Invalid or expired OTP.");
    }
    return true;
  }

  const otpRecord = await prisma.otpVerification.findFirst({
    where: { mobileNo: data.mobileNo },
  });

  if (!otpRecord) {
    throw new ApiError(400, "OTP not generated or expired.");
  }

  if (otpRecord.otp !== data.otp) {
    throw new ApiError(400, "Invalid OTP.");
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new ApiError(400, "OTP has expired.");
  }

  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { isVerified: true },
  });

  return true;
}

export async function createProjectEnquiry(data: {
  projectId?: string;
  fullName: string;
  emailAddress: string;
  mobileNo: string;
  query?: string;
}) {
  const projectEnquiry = await prisma.projectEnquiry.create({
    data: {
      projectId: data.projectId || null,
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      mobileNo: data.mobileNo,
      query: data.query || null,
    },
  });
  return projectEnquiry;
}

export async function createLandOwnerConnectEnquiry(data: {
  fullName: string;
  mobileNo: string;
  emailAddress: string;
  landLocation: string;
  landArea: string;
  landType: string;
  ownershipStatus: string;
  additionalDetails?: string;
  pageUrl?: string;
}) {
  return await prisma.landOwnerConnect.create({
    data: {
      fullName: data.fullName,
      mobileNo: data.mobileNo,
      emailAddress: data.emailAddress,
      landLocation: data.landLocation,
      landArea: data.landArea,
      landType: data.landType,
      ownershipStatus: data.ownershipStatus,
      additionalDetails: data.additionalDetails || null,
      pageUrl: data.pageUrl || null,
    },
  });
}

