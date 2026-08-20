import z from "zod";

export const createProjectContentDetailsSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    title: z.string().optional(),
    description: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    files: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateProjectContentDetailsSchema = z.object({
  body: z.object({
    projectId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    files: z.record(z.string(), z.unknown()).optional(),
  }),
});
