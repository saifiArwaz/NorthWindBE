import z from "zod";

export const createProjectStatusSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateProjectStatusSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
