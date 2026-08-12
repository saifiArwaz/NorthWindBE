import z from "zod";

export const createProjectContentDetailsSchema = z.object({
  body: z.object({
    type: z.string().min(3, "Type is required"),
    projectId: z.string().min(1, "Project ID is required"),
    title: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    list: z.union([z.string(), z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    files: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateProjectContentDetailsSchema = z.object({
  body: z.object({
    type: z.string().optional(),
    projectId: z.string().optional(),
    title: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    list: z.union([z.string(), z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
    files: z.record(z.string(), z.unknown()).optional(),
  }),
});
