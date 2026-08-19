import z from "zod";
import { prisma } from "../../config/prisma.config.js";
import { FileType } from "../../generated/prisma/enums.js";

export const createEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    alt: z.string().optional(),
    fileType: z.nativeEnum(FileType).optional(),
    categoryId: z.string().optional(),
    eventId: z.string().optional(),
    watermark: z.string().optional(),
  }).refine(data => data.categoryId || data.eventId, {
    message: "Either categoryId or eventId must be provided",
    path: ["categoryId"],
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
    }
  }
});

export const updateEventGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    alt: z.string().optional(),
    categoryId: z.string().optional(),
    fileType: z.nativeEnum(FileType).optional(),
    eventId: z.string().optional(),
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
    }
  }
});
