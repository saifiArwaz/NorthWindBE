import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createCitiesSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name field is required"),
      stateId: z.string().min(1, "State ID is required"),
      seoTags: z.record(z.string(), z.unknown()).optional(),
    })
    .superRefine(async (data, ctx) => {
      if (data.stateId) {
        const state = await prisma.state.findFirst({
          where: { id: data.stateId, isDeleted: false },
        });

        if (!state) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["stateId"],
            message: "Selected state does not exist",
          });
          return; // no point checking city name if state is invalid
        }
      }

      // Check uniqueness only within the same state
      const city = await prisma.city.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          stateId: data.stateId,
          isDeleted: false,
        },
      });

      if (city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "City with this name already exists in the selected state",
        });
      }
    }),
});

export const updateCitiesSchema = z.object({
  params: z
    .object({
      id: z.string(),
    })
    .optional(),
  body: z
    .object({
      name: z.string().min(2, "Name field is required").optional(),
      stateId: z.string().min(1, "State ID must not be empty").optional(),
      seoTags: z.record(z.string(), z.unknown()).optional(),
    })
    .superRefine(async (data, ctx) => {
      if (data.stateId) {
        const state = await prisma.state.findFirst({
          where: { id: data.stateId, isDeleted: false },
        });

        if (!state) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["stateId"],
            message: "Selected state does not exist",
          });
        }
      }
    }),
});
