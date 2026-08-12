import z from "zod";

export const createMediaKitSchema = z.object({
  body: z.object({
    link: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateMediaKitSchema = z.object({
  body: z.object({
    link: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
