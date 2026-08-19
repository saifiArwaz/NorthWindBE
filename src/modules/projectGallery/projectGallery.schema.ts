import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectGallerySchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      fileType: z.string().min(1, "File Type field is required"),
      image: z.string().optional(),
      video: z.string().optional(),
      link: z.string().optional(),
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

export const updateprojectGallerySchema = z.object({
  body: z.object({
    fileType: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    link: z.string().optional(),
  }),
});
