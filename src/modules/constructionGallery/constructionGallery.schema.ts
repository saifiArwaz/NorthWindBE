import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createconstructionGallerySchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      title: z.string().optional(),
      dateAt: z.preprocess(
        (val) => (typeof val === "string" || typeof val === "number" ? new Date(val) : val),
        z.date().optional()
      ),
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

export const updateconstructionGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    dateAt: z.preprocess(
      (val) => (typeof val === "string" || typeof val === "number" ? new Date(val) : val),
      z.date().optional()
    ),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
