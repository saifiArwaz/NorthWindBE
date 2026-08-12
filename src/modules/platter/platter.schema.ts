import z from "zod";

export const createPlatterSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
    title: z.record(z.string(), z.unknown()).optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    seoTags: z
      .record(z.string(), z.unknown())
      .refine((val) => Object.keys(val).length > 0, {
        message: "SEO tags are required",
      })
      .optional(),
  }),
});

export const updatePlatterSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
    title: z.record(z.string(), z.unknown()).optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    seoTags: z.record(z.string(), z.unknown()).optional(),
  }),
});
