import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event ID is required"),
    name: z.string().min(3, "Name field is required"),
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
    }
  }
});

export const updateEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string().optional(),
    name: z.string().optional(),
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
    }
  }
});
