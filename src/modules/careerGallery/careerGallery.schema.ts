import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createCareerGallerySchema = z.object({
  body: z.object({
    desktopImg: z.string().optional().nullable(),
    mobileImg: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
  }),
});

export const updateCareerGallerySchema = z.object({
  body: z.object({
    desktopImg: z.string().optional().nullable(),
    mobileImg: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
  }),
});
