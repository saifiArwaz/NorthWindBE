import z from "zod";
import { prisma } from "../../config/prisma.config.js";
import { FileType } from "../../generated/prisma/enums.js";

export const createEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    alt: z.string().optional(),
    fileType: z.nativeEnum(FileType).optional(),
    categoryId: z.string().optional(),
    eventId: z.string().optional(),
    watermark: z.string().optional(),
  }).refine((data) => data.eventId, {
    message: "Event ID is required",
    path: ["eventId"],
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.eventId) {
    const event = await prisma.event.findUnique({
      where: { id: data.body.eventId, isDeleted: false, status: true },
    });
    if (!event) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid or inactive Event ID",
        path: ["body", "eventId"],
      });
      return;
    }
  }

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
    } else if (category.eventId !== data.body.eventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Category does not belong to the specified Event",
        path: ["body", "categoryId"],
      });
    }
  }
});

export const updateEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    alt: z.string().optional(),
    categoryId: z.string().optional(),
    fileType: z.nativeEnum(FileType).optional(),
    eventId: z.string().optional(),
    watermark: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
}).superRefine(async (data, ctx) => {
  if (data.body.eventId) {
    const event = await prisma.event.findUnique({
      where: { id: data.body.eventId, isDeleted: false },
    });
    if (!event) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Event ID",
        path: ["body", "eventId"],
      });
      return;
    }
  }

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
    } else if (data.body.eventId && category.eventId !== data.body.eventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Category does not belong to the specified Event",
        path: ["body", "categoryId"],
      });
    }
  }
});
