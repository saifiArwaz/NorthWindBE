import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createCsrGallerySchema = z
  .object({
    body: z.object({
      title: z.string().optional().nullable(),
      categoryId: z.string().optional().nullable(),
      link: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
      watermark: z.string().optional().nullable(),
      files: z.any().optional(),
    }),
  })
  .superRefine(async (data, ctx) => {
    const categoryId = data.body.categoryId;
    if (categoryId && typeof categoryId === "string" && categoryId.trim() !== "") {
      const category = await prisma.csrCategory.findFirst({
        where: { id: categoryId.trim(), isDeleted: false },
      });
      if (!category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "categoryId"],
          message: "CSR Category not found",
        });
      }
    }
  });

export const updateCsrGallerySchema = z
  .object({
    params: z
      .object({
        id: z.string(),
      })
      .optional(),
    body: z.object({
      title: z.string().optional().nullable(),
      categoryId: z.string().optional().nullable(),
      link: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
      watermark: z.string().optional().nullable(),
      status: z.union([z.boolean(), z.string()]).optional(),
      files: z.any().optional(),
    }),
  })
  .superRefine(async (data, ctx) => {
    const categoryId = data.body.categoryId;
    if (categoryId && typeof categoryId === "string" && categoryId.trim() !== "") {
      const category = await prisma.csrCategory.findFirst({
        where: { id: categoryId.trim(), isDeleted: false },
      });
      if (!category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "categoryId"],
          message: "CSR Category not found",
        });
      }
    }
  });
