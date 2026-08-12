import z from "zod";

export const createValuesSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    status: z.boolean().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateValuesSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    status: z.boolean().optional(),
    watermark: z.string().optional(),
  }),
});
