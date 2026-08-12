import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectReraSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      phase: z.string().optional(),
      reraNumber: z.string().optional(),
    })
    .superRefine(async (data, ctx) => {
      const project = await prisma.projects.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["projectId"],
          message: "Project not found",
        });
      }
    }),
});

export const updateprojectReraSchema = z.object({
  body: z.object({
    phase: z.string().optional(),
    reraNumber: z.string().optional(),
  }),
});
