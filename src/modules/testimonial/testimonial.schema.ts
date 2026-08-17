import z from "zod";

export const createTestimonialSchema = z.object({
  body: z.object({
    fileType: z.string().default("image"),
    name: z.string().nullable().optional(),
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    link: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isFeature: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
    isHome: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
    status: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
  }),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    fileType: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    link: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isFeature: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
    isHome: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
    status: z.preprocess((val) => val === 'true' || val === true || val === 1 || val === '1', z.boolean().optional()),
  }),
});
