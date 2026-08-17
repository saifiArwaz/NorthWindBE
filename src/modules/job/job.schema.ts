import z from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    location: z.any().optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    jobType: z.string().optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    location: z.any().optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    jobType: z.string().optional(),
  }),
});

