import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createprojectTowerSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project Id is required"),
    name: z.string().min(1, "Name is required"),
    slug: z.string().optional(),
    title: z.any().optional(),
    description: z.any().optional(),
    link: z.string().optional(),
    list: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  }).superRefine(async (data, ctx) => {
    const project = await prisma.projects.findUnique({ where: { id: data.projectId } });
    if (!project) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["projectId"], message: "Project not found" });
    }
  })
});

export const updateprojectTowerSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    title: z.any().optional(),
    description: z.any().optional(),
    link: z.string().optional(),
    list: z.any().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
  })
});
