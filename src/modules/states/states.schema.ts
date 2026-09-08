import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createStateSchema = z
  .object({
    body: z.object({
      name: z.string().min(2, "State name is required"),
    }),
  })
  .superRefine(async (data, ctx) => {
    const existingState = await prisma.state.findFirst({
      where: {
        name: { equals: data.body.name, mode: "insensitive" },
        isDeleted: false,
      },
    });

    if (existingState) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "name"],
        message: "State with this name already exists",
      });
    }
  });

export const updateStateSchema = z
  .object({
    params: z
      .object({
        id: z.string(),
      })
      .optional(),
    body: z.object({
      name: z.string().min(2, "State name is required").optional(),
    }),
  })
  .superRefine(async (data, ctx) => {
    const stateId = data.params?.id;

    if (data.body.name) {
      const existingState = await prisma.state.findFirst({
        where: {
          name: { equals: data.body.name, mode: "insensitive" },
          isDeleted: false,
          id: stateId ? { not: stateId } : undefined,
        },
      });

      if (existingState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "name"],
          message: "State with this name already exists",
        });
      }
    }
  });
