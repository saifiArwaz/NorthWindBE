import { z } from "zod";

export const createWhyIndiaSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    shortDescription: z.string().optional(),
    tags: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});

export const updateWhyIndiaSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    shortDescription: z.string().optional(),
    tags: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
