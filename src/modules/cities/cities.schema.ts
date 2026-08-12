import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createCitiesSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name field is required"),
      seoTags: z.record(z.string(), z.unknown()).optional(),
    })
    .superRefine(async (data, ctx) => {
      const city = await prisma.city.findFirst({
        where: { name: data.name },
      });

      if (city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "City already exists",
        });
      }
    }),
});

export const updateCitiesSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
    seoTags: z.record(z.string(), z.unknown()).optional(),
  }),
});
