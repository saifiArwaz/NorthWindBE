import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    alt: z.string().optional(),
    categoryId: z.string().min(1, "Category ID is required"),
    parentGalleryId: z.string().optional(),
    watermark: z.string().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.categoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: data.body.categoryId, isDeleted: false, status: true },
    });
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid or inactive Category ID",
        path: ["body", "categoryId"],
      });
    }
  }

  if (data.body.parentGalleryId) {
    const parentGallery = await prisma.eventGalleries.findUnique({
      where: { id: data.body.parentGalleryId, isDeleted: false, status: true },
    });
    
    if (!parentGallery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid or inactive Parent Gallery ID",
        path: ["body", "parentGalleryId"],
      });
    } else if (parentGallery.categoryId !== data.body.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parent gallery must belong to the same category",
        path: ["body", "parentGalleryId"],
      });
    }
  }
});

export const updateEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    alt: z.string().optional(),
    categoryId: z.string().optional(),
    parentGalleryId: z.string().optional(),
    watermark: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.categoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: data.body.categoryId, isDeleted: false },
    });
    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Category ID",
        path: ["body", "categoryId"],
      });
    }
  }
  
  if (data.body.parentGalleryId) {
    const parentGallery = await prisma.eventGalleries.findUnique({
      where: { id: data.body.parentGalleryId, isDeleted: false },
    });
    
    if (!parentGallery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Parent Gallery ID",
        path: ["body", "parentGalleryId"],
      });
    }
  }
});

export const changeFeatureSchema = z.object({
  body: z.object({
    isFeature: z.coerce.boolean(),
  }),
});
