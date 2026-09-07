import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectMasterPlanPinGallerySchema = z.object({
  body: z.object({
    pinId: z.string().min(1, "Pin ID is required"),
    title: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    files: z.any().optional(),
  }),
}).superRefine(async (data, ctx) => {
  const pin = await prisma.projectMasterPlanPin.findUnique({
    where: { id: data.body.pinId },
  });

  if (!pin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body", "pinId"],
      message: "Pin not found",
    });
  }
});

export const updateProjectMasterPlanPinGallerySchema = z.object({
  params: z.object({
    id: z.string(),
  }).optional(),
  body: z.object({
    pinId: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    files: z.any().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.pinId) {
    const pin = await prisma.projectMasterPlanPin.findUnique({
      where: { id: data.body.pinId },
    });

    if (!pin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "pinId"],
        message: "Pin not found",
      });
    }
  }
});
