import { z } from "zod";

export const createPageSchema = z.object({
  body: z
    .object({
      title: z.string().min(3, "Title filed is required"),
      dateAt: z.preprocess(
        (val) =>
          typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : val,
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Invalid date format",
        }),
      ).optional(),
      description: z.record(z.string(), z.unknown()).optional(),
      seoTags: z.record(z.string(), z.unknown()).optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      status: z.boolean().optional(),
    })
});

export const updatePageSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    seoTags: z.record(z.string(), z.unknown()).optional(),
    alt: z.string().optional(),
       dateAt: z.preprocess(
        (val) =>
          typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : val,
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Invalid date format",
        }),
      ).optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
