import z from "zod";

export const createEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string(),
    name: z.string().min(3, "Name field is required"),
    slug: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
});

export const updateEventCategorySchema = z.object({
  body: z.object({
    eventId: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
});
