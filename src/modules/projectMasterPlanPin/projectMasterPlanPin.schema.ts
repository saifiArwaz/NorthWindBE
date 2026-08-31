import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectMasterPlanPinSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    categoryId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    coordinates: z.any().optional(),
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

  if (data.body.categoryId) {
    const category = await prisma.projectMasterPlanCategory.findUnique({
      where: { id: data.body.categoryId },
    });

    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "categoryId"],
        message: "Category not found",
      });
    } else if (category.projectId !== data.body.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "categoryId"],
        message: "Category does not belong to the specified project",
      });
    }
  }

  const existingPin = await prisma.projectMasterPlanPin.findFirst({
    where: {
      projectId: data.body.projectId,
      title: { equals: data.body.title, mode: "insensitive" },
      isDeleted: false,
    },
  });

  if (existingPin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body", "title"],
      message: "Pin with this title already exists in this project",
    });
  }
});

export const updateProjectMasterPlanPinSchema = z.object({
  params: z.object({
    id: z.string(),
  }).optional(),
  body: z.object({
    projectId: z.string().optional(),
    categoryId: z.string().optional(),
    title: z.string().optional(),
    coordinates: z.any().optional(),
  }),
}).superRefine(async (data, ctx) => {
  const pinId = data.params?.id;

  let currentProjectId = data.body.projectId;

  if (pinId) {
    const existingRecord = await prisma.projectMasterPlanPin.findUnique({
      where: { id: pinId },
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

  if (data.body.categoryId) {
    const category = await prisma.projectMasterPlanCategory.findUnique({
      where: { id: data.body.categoryId },
    });

    if (!category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "categoryId"],
        message: "Category not found",
      });
    } else if (category.projectId !== currentProjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "categoryId"],
        message: "Category does not belong to the specified project",
      });
    }
  }

  if (data.body.title && currentProjectId) {
    const existingPin = await prisma.projectMasterPlanPin.findFirst({
      where: {
        projectId: currentProjectId,
        title: { equals: data.body.title, mode: "insensitive" },
        isDeleted: false,
        id: pinId ? { not: pinId } : undefined,
      },
    });

    if (existingPin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "title"],
        message: "Pin with this title already exists in this project",
      });
    }
  }
});
