import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectMasterPlanCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
  }),
}).superRefine(async (data, ctx) => {
  const existingCategory = await prisma.projectMasterPlanCategory.findFirst({
    where: {
      name: { equals: data.body.name, mode: "insensitive" },
      isDeleted: false,
    },
  });

  if (existingCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body", "name"],
      message: "Category with this name already exists",
    });
  }
});

export const updateProjectMasterPlanCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }).optional(),
  body: z.object({
    name: z.string().optional(),
    status: z.boolean().optional(),
  }),
}).superRefine(async (data, ctx) => {
  const categoryId = data.params?.id;

  if (data.body.name) {
    const existingCategory = await prisma.projectMasterPlanCategory.findFirst({
      where: {
        name: { equals: data.body.name, mode: "insensitive" },
        isDeleted: false,
        id: categoryId ? { not: categoryId } : undefined,
      },
    });

    if (existingCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "name"],
        message: "Category with this name already exists",
      });
    }
  }
});
