import z from "zod";

export const createTypologySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateTypologySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
