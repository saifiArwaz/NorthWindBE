import z from "zod";

export const createCitiesSectionSchema = z.object({
  body: z.object({
    cityId: z.string().min(3, "City id field is required"),
    sectionType: z.string().min(3, "Section type field is required"),
    title: z
      .record(z.string(), z.unknown())
      .refine((val) => Object.keys(val).length > 0, {
        message: "Title is required",
      }),
    description: z.record(z.string(), z.unknown()).optional(),
    list: z.record(z.string(), z.unknown()).optional(),
  }),
});
