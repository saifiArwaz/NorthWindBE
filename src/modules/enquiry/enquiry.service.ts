import { prisma } from "../../config/prisma.config.js";
import { paginate } from "../../utils/pagination.utils.js";

export async function getJobApplication(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { emailAddress: { contains: search, mode: "insensitive" } },
          { phoneNo: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  return paginate(
    prisma.jobApplication,
    {
      where,
      orderBy: { dateAt: "desc" },
      include: {
        jobs: true,
      },
    },
    { page, limit },
  );
}

export async function getNewsletterEnquiry(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ emailAddress: { contains: search, mode: "insensitive" } }],
      }
    : {};
  return paginate(
    prisma.newsLetterEnquiry,
    {
      where,
      orderBy: { dateAt: "desc" },
    },
    { page, limit },
  );
}

export async function getContactEnquiry(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ fullName: { contains: search, mode: "insensitive" } }],
      }
    : {};
  return paginate(
    prisma.contactEnquiry,
    {
      where,
      orderBy: { dateAt: "desc" },
    },
    { page, limit },
  );
}

export async function getProjectEnquiry(page = 1, limit = 10, search = "") {
  const where = search
    ? {
        OR: [{ fullName: { contains: search, mode: "insensitive" } }],
      }
    : {};
  return paginate(
    prisma.projectEnquiry,
    {
      where,
      orderBy: { dateAt: "desc" },
      include: {
        projects: true,
      },
    },
    { page, limit },
  );
}
export async function getJobApplicationById(id: string) {
  return await prisma.jobApplication.findUnique({
    where: { id },
  });
}

export async function getFloorplanTowerEnquiry(page = 1, limit = 10, search = "") {
  const where: any = { isVerified: true };
  if (search) {
    where.OR = [{ fullName: { contains: search, mode: "insensitive" } }];
  }
  return paginate(
    prisma.floorplanTowerEnquiry,
    {
      where,
      orderBy: { dateAt: "desc" },
      include: {
        projects: true,
      },
    },
    { page, limit },
  );
}
