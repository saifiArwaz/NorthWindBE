import z from "zod";

export const createAwardsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    description: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateAwardsSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

