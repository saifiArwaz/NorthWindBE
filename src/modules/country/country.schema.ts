import z from "zod";

export const createCountrySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateCountrySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
