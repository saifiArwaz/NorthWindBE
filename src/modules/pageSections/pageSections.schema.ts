import z from "zod";
import { FileType } from "../../generated/prisma/enums.js";

export const createPageSectionSchema = z.object({
  body: z.object({
    pageSlug: z.string().min(1, "Page slug is required"),
    type: z.string().min(1, "Type is required"),
    title: z.any().refine((val) => val !== undefined, "Title is required"),
    description: z.any().optional(),
    files: z.any().optional(),
    list: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional().default(true),
  }),
});

export const updatePageSectionSchema = z.object({
  body: z.object({
    pageSlug: z.string().min(1, "Page slug is required").optional(),
    type: z.string().optional(),
    title: z.any().optional(),
    description: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    files: z.any().optional(),
    list: z.any().optional(),
  }),
});
