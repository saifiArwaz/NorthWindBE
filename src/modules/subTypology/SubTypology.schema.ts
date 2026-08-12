import z from "zod";

export const createSubTypologySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateSubTypologySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
