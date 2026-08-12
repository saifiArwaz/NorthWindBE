import z from "zod";

export const createStateSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateStateSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
