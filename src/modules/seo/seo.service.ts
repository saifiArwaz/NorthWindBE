import { parseSeoSlug } from "./seo.parser.js";
import { prisma } from "../../config/prisma.config.js";
import { buildProjectQuery } from "./seo.query-builder.js";
import { generateSeo } from "./seo.meta.js";
import { SeoLinkType } from "../../generated/prisma/enums.js";
import { ApiError } from "../../utils/apiError.utils.js";

// Convert BigInt fields to Number so JSON.stringify works
function serializeProjects(projects: any[]) {
  return projects.map((p) => ({
    ...p,
    price: p.price != null ? Number(p.price) : null,
  }));
}

export async function getSeoProjects(slug: string) {
  const checkCustomSeo = await prisma.seoFooterLink.findUnique({
    where: {
      slug,
    },
  });

  if (!checkCustomSeo) {
    throw new ApiError(404, "URL not found");
  }

  const parsed = parseSeoSlug(slug);

  if (!parsed) {
    throw new Error("Invalid SEO URL");
  }

  // CHECK CUSTOM SEO
  const customSeo = await prisma.seoPage.findFirst({
    where: {
      footerLinkId: checkCustomSeo.id,
    } as any,
    include: {
      footerLink: {
        select: {
          slug: true,
          type: true,
          label: true,
        },
      },
    },
  });

  // BUILD QUERY
  const where = await buildProjectQuery(parsed);
  // FETCH PROJECTS
  const projects = await prisma.projects.findMany({
    where,
  });

  return {
    seo: customSeo || generateSeo(parsed),
    filters: parsed,
    projects: serializeProjects(projects),
  };
}

export async function getFooterLinks() {
  const footerLinks = await prisma.seoFooterLink.findMany({
    where: {
      status: true,
    },
    orderBy: {
      seq: "asc",
    },
    select: {
      id: true,
      label: true,
      slug: true,
      type: true,
      seq: true,
      status: true,
      projects: {
        select: {
          id: true,
          projectName: true,
          slug: true,
          platter: {
            select: {
              name: true,
              slug: true,
            },
          },
          projectStatus: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const projectLinks = footerLinks.filter(
    (item) => item.type === SeoLinkType.PROJECT,
  );

  return {
    PRICE: footerLinks.filter((item) => item.type === SeoLinkType.PRICE),

    TYPOLOGY: footerLinks.filter((item) => item.type === SeoLinkType.TYPOLOGY),

    LOCATION: footerLinks.filter((item) => item.type === SeoLinkType.LOCATION),

    RESIDENTIAL: projectLinks.filter((item) => {
      const proj = item.projects;
      if (!proj) return true;
      const platterSlug = proj.platter?.slug?.toLowerCase();
      return platterSlug === "residential";
    }),

    COMMERCIAL: projectLinks.filter((item) => {
      const proj = item.projects;
      if (!proj) return false;
      const platterSlug = proj.platter?.slug?.toLowerCase();
      return platterSlug === "commercial";
    }),

    NEW_LAUNCH: projectLinks.filter((item) => {
      const proj = item.projects;
      if (!proj) return false;
      const platterSlug = proj.platter?.slug?.toLowerCase();
      if (platterSlug === "commercial") return false;
      const statusSlug = proj.projectStatus?.slug?.toLowerCase();
      return statusSlug === "new-launch";
    }),

    COMPLETED: projectLinks.filter((item) => {
      const proj = item.projects;
      if (!proj) return false;
      const platterSlug = proj.platter?.slug?.toLowerCase();
      if (platterSlug === "commercial") return false;
      const statusSlug = proj.projectStatus?.slug?.toLowerCase();
      return statusSlug === "completed";
    }),
  };
}
