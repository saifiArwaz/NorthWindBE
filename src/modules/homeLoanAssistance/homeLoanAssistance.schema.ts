import z from "zod";

export const createHomeLoanAssistanceSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    status: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
  }),
});

export const updateHomeLoanAssistanceSchema = z.object({
  body: z.object({
    title: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    status: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
  }),
});
