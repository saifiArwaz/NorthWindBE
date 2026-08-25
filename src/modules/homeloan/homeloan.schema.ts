import z from "zod";

export const createHomeLoanSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    name: z.string().optional(),
    alt: z.string().optional(), 
  }),
});

export const updateHomeLoanSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    name: z.string().optional(),
    alt: z.string().optional(),
  }),
});
