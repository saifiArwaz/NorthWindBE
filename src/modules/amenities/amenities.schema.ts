import z from "zod";

export const createAmenitiesSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    status: z.boolean().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateAmenitiesSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    status: z.boolean().optional(),
    watermark: z.string().optional(),
  }),
});
