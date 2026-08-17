import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createEventGallerySchema = z.object({
  body: z.object({
    alt: z.string().optional(),
    categoryId: z.string().min(1, "Category ID is required"),
    watermark: z.string().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.categoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: data.body.categoryId },
    });
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Category ID",
        path: ["body", "categoryId"],
      });
    }
  }
});

export const updateEventGallerySchema = z.object({
  body: z.object({
    alt: z.string().optional(),
    categoryId: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.categoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: data.body.categoryId },
    });
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Category ID",
        path: ["body", "categoryId"],
      });
    }
  }
});
