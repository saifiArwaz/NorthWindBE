import z from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    status: z.coerce.boolean().optional(),
    seq: z.coerce.number().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    status: z.coerce.boolean().optional(),
  }),
});

