import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectMediaSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      fileType: z.enum(["image", "video", "link"], {
        error: "Invalid file type",
      }),
      mediaType: z.enum(
        ["walkthrough", "lifestyle", "location", "construction"],
        { error: "Invalid media type" },
      ),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      link: z.string().optional(),
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

export const updateprojectMediaSchema = z.object({
  body: z.object({
    fileType: z
      .enum(["image", "video", "link"], { error: "Invalid file type" })
      .optional(),
    mediaType: z
      .enum(["walkthrough", "lifestyle", "location", "construction"], {
        error: "Invalid media type",
      })
      .optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    link: z.string().optional(),
  }),
});
