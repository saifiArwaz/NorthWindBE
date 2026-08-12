import z from "zod";

export const createSeoPageSchema = z.object({
  body: z.object({}),
});

export const updateSeoPageSchema = z.object({
  body: z.object({}),
});
