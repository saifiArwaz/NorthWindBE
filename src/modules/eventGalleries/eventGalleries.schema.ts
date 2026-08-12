import z from "zod";

export const createEventGallerySchema = z.object({
  body: z.object({
    alt: z.string().optional(),
    title: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateEventGallerySchema = z.object({
  body: z.object({
    alt: z.string().optional(),
    title: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
