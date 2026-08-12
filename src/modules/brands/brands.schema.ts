import z from "zod";

export const createBrandsSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
  }),
});

export const updateBrandsSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
  }),
});
