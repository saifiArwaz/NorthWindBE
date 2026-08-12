import z from "zod";

export const createNewsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "This field is required"),
    // newsLink: z.string().min(3, "Social link is required"),
    // dateAt: z.preprocess(
    //   (val) => (typeof val === "string" || typeof val === "number") ? new Date(val) : val,
    //   z.date().refine((d) => !isNaN(d.getTime()), {
    //       message: "Invalid date format"
    //   })
    // ),
  }),
});

export const updateNewsSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    newsLink: z.string().optional(),
  }),
});
