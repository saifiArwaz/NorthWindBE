import { z } from "zod";

const platterSlugQuery = z.object({
  query: z.object({
    platterSlug: z.string().min(1, "platterSlug is required"),
  }),
});

const locationQuery = z.object({
  query: z.object({
    platterSlug: z.string().min(1, "platterSlug is required"),
    locationSlug: z.string().min(1).optional(),
    locationType: z.enum(["city", "locality"]).optional(),
  }),
});

const projectsQuery = z.object({
  query: z.object({
    platterSlug: z.string().min(1, "platterSlug is required"),
    locationSlug: z.string().min(1, "locationSlug is required"),
    locationType: z.enum(["city", "locality"]).default("city"),
    minPrice: z.coerce.number().min(0, "minPrice is required"),
    maxPrice: z.coerce.number().min(0, "maxPrice is required"),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
});

export const enquiryFlowPlatterSchema = z.object({
  query: z.object({}).optional(),
});
export const enquiryFlowLocationSchema = platterSlugQuery;
export const enquiryFlowBudgetSchema = locationQuery;
export const enquiryFlowProjectsSchema = projectsQuery;
