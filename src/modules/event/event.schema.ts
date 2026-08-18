import z from "zod";

export const eventSchema = {
  create: z.object({
    body: z.object({
      title: z.string().min(1, "Title is required"),
      status: z.coerce.boolean().optional(),
      seq: z.coerce.number().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      title: z.string().optional(),
      status: z.coerce.boolean().optional(),
    }),
  }),
  changeStatus: z.object({
    body: z.object({
      status: z.coerce.boolean(),
    }),
  }),
  changeSeq: z.object({
    body: z.object({
      seq: z.coerce.number(),
    }),
  }),
};
