import z from "zod";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
    designation: z.string().min(3, "Designation field is required"),
    description: z.record(z.string(), z.unknown()).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
