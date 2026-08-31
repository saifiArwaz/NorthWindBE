import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectMasterPlanCategorySchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(1, "Name is required"),
  }),
}).superRefine(async (data, ctx) => {
  const project = await prisma.projects.findUnique({
    where: { id: data.body.projectId },
  });

  if (!project) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body", "projectId"],
      message: "Project not found",
    });
  }

  const existingCategory = await prisma.projectMasterPlanCategory.findFirst({
    where: {
      projectId: data.body.projectId,
      name: { equals: data.body.name, mode: "insensitive" },
      isDeleted: false,
    },
  });

  if (existingCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body", "name"],
      message: "Category with this name already exists in this project",
    });
  }
});

export const updateProjectMasterPlanCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }).optional(),
  body: z.object({
    projectId: z.string().optional(),
    name: z.string().optional(),
  }),
}).superRefine(async (data, ctx) => {
  const categoryId = data.params?.id;

  let currentProjectId = data.body.projectId;

  if (categoryId) {
    const existingRecord = await prisma.projectMasterPlanCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingRecord) return;
    if (!currentProjectId) {
      currentProjectId = existingRecord.projectId;
    }
  }

  if (data.body.projectId) {
    const project = await prisma.projects.findUnique({
      where: { id: data.body.projectId },
    });

    if (!project) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "projectId"],
        message: "Project not found",
      });
    }
  }

  if (data.body.name && currentProjectId) {
    const existingCategory = await prisma.projectMasterPlanCategory.findFirst({
      where: {
        projectId: currentProjectId,
        name: { equals: data.body.name, mode: "insensitive" },
        isDeleted: false,
        id: categoryId ? { not: categoryId } : undefined,
      },
    });

    if (existingCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "name"],
        message: "Category with this name already exists in this project",
      });
    }
  }
});
