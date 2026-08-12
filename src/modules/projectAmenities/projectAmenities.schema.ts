import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectAmenitiesSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      title: z.string().min(1, "Title field is required"),
      status: z.boolean().optional(),
      watermark: z.string().optional(),
      seq: z.number().int().optional(),
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

export const updateProjectAmenitiesSchema = z.object({
  body: z.object({
    projectId: z.string().optional(),
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    seq: z.number().int().optional(),
  }),
});
