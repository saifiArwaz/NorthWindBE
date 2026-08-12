import z from "zod";

export const createMenuItemSchema = z.object({
  body: z.object({
    label: z.string().min(3, "Label field is required"),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    label: z.string().optional(),
  }),
});
