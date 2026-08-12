import z from "zod";

export const createTimelineSchema = z.object({
  body: z.object({
    year: z.string().optional(),
    title: z.string().optional(),
  }),
});

export const updateTimelineSchema = z.object({
  body: z.object({
    year: z.string().optional(),
    title: z.string().optional(),
  }),
});
