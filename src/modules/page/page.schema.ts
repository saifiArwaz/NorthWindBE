import { z } from "zod";

export const createPageSchema = z.object({
  body: z.object({
    pageName: z.string().min(1, "Page name is required"),
    title: z.record(z.string(), z.unknown()).optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    seoTags: z.record(z.string(), z.unknown()).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});

export const updatePageSchema = z.object({
  body: z.object({
    pageName: z.string().optional(),
    title: z.record(z.string(), z.unknown()).optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    seoTags: z.record(z.string(), z.unknown()).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
