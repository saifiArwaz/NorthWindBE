import z from "zod";

const categoryEnum = z.enum(["upcoming", "ongoing", "old"]);

export const createLegacyProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name field is required"),
    category: categoryEnum.optional().default("upcoming"),
    location: z.string().optional(),
    description: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateLegacyProjectSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    category: categoryEnum.optional(),
    location: z.string().optional(),
    description: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});
