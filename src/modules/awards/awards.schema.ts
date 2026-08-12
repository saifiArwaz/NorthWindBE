import z from "zod";

export const createAwardsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    year: z.preprocess(
      (val) =>
        typeof val === "string" || typeof val === "number"
          ? new Date(val)
          : val,
      z.date().refine((d) => !isNaN(d.getTime()), {
        message: "Invalid date format",
      }),
    ),
    shortDescription: z.string().optional(),
    organization: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateAwardsSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    year: z
      .preprocess(
        (val) =>
          typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : val,
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Invalid date format",
        }),
      )
      .optional(),
    shortDescription: z.string().optional(),
    organization: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

