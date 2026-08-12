import z from "zod";
import { prisma } from "../../config/prisma.config.js";
export const createinvestorDocumentschema = z.object({
  body: z
    .object({
      inverstorTabId: z.string().optional(),
      title: z.string().optional(),
      type: z.string().optional(),
    })
    .superRefine(async (data, ctx) => {
      const category = await prisma.inverstorTabs.findUnique({
        where: { id: data.inverstorTabId },
      });

      if (!category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["inverstorTabId"],
          message: "Inverstor Tab Record not found",
        });
      }
    }),
});

export const updateinvestorDocumentschema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});
