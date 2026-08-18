import z from "zod";

export const createEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string(),
    name: z.string().min(3, "Name field is required"),
    status: z.coerce.boolean().optional(),
  }),
});

export const updateEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string().optional(),
    name: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
});
