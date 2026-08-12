import z from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    designation: z.string().optional(),
    location: z.any().optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    jobType: z.string().optional(),
    skills: z
      .array(z.string().trim().min(1))
      .optional(),

    qualifications: z
      .array(z.string().trim().min(1))
      .optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    designation: z.string().optional(),
    location: z.any().optional(),
    description: z.record(z.string(), z.unknown()).optional(),
    jobType: z.string().optional(),
    skills: z
      .array(z.string().trim().min(1))
      .optional(),

    qualifications: z
      .array(z.string().trim().min(1))
      .optional(),
  }),
});

