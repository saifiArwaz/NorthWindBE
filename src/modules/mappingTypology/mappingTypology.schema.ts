import z from "zod";

export const createMappingTypologySchema = z.object({
  body: z.object({
    typologyId: z.string().min(1, "Typology Id is required"),
    subTypologyId: z.string().min(1, "Sub Typology Id is required"),
  }),
});

export const updateSubTypologySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
