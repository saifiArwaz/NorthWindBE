import z from "zod";

export const createOfficesLocationSchema = z.object({
  body: z.object({
    city: z.string().min(3, "City field is required"),
    officeName: z.string().min(3, "Office name is required"),
    list: z.any().optional(),
  }),
});

export const updateOfficesLocationSchema = z.object({
  body: z.object({
    city: z.string().optional(),
    officeName: z.string().optional(),
    list: z.any().optional(),
  }),
});
