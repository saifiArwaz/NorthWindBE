import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectFloorplanSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      type: z.string().min(1, "Type field is required"),
      list: z.any().optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
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

export const updateprojectFloorplanSchema = z.object({
  body: z.object({
    type: z.string().optional(),
    list: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});
