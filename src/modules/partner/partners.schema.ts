import z from "zod";

export const createPartnersSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(), 
  }),
});

export const updatePartnersSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
  }),
});
