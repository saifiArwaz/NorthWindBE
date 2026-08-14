import z from "zod";

export const createProjectSectionsSchema = z.object({
  body: z.object({
    type: z.string().min(3, "Section type field is required"),
    title: z
      .record(z.string(), z.unknown())
      .refine((val) => Object.keys(val).length > 0, {
        message: "Title is required",
      }),
    description: z.record(z.string(), z.unknown()).optional(),
    list: z.any().optional(),
  }),
});
