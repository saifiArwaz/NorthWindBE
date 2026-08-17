import z from "zod";

export const createEventCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
    status: z.boolean().optional(),
  }),
});

export const updateEventCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
