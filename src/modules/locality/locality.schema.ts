import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createLocalitySchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name field is required"),
      cityId: z.string().min(1, "City ID is required"),
    })
    .superRefine(async (data, ctx) => {
      const locality = await prisma.locality.findFirst({
        where: { name: data.name, cityId: data.cityId },
      });

      if (locality) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Locality already exists in this city",
        });
      }
    }),
});

export const updateLocalitySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required").optional(),
    cityId: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
