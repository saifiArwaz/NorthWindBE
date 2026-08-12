import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectLocationAdvSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      duration: z.string().optional(),
      destination: z.string().min(3, "Destination field is required"),
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

export const updateprojectLocationAdvSchema = z.object({
  body: z.object({
    duration: z.string().optional(),
    destination: z.string().optional(),
  }),
});
