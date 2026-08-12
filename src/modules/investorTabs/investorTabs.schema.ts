import z from "zod";

export const createinvestorTabSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
  }),
});

export const updateinvestorTabSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});
