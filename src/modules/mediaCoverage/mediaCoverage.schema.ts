import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createMediaCoverageSchema = z.object({
  body: z
    .object({
      title: z.any().optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      dateAt: z.preprocess(
        (val) =>
          typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : val,
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Invalid date format",
        }),
      ).optional(),
      link: z.string().optional(),
      description: z.string().optional(),
    })
});

export const updateMediaCoverageSchema = z.object({
  body: z.object({
    title: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    dateAt: z.preprocess(
      (val) =>
        typeof val === "string" || typeof val === "number"
          ? new Date(val)
          : val,
      z.date().refine((d) => !isNaN(d.getTime()), {
        message: "Invalid date format",
      }),
    ).optional(),
    link: z.string().optional(),
    description: z.string().optional(),
  }),
});
