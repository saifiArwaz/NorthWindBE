import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectBannerSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      desktopImg: z.string().optional().nullable(),
      mobileImg: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
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

export const updateProjectBannerSchema = z.object({
  body: z.object({
    desktopImg: z.string().optional().nullable(),
    mobileImg: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
  }),
});
