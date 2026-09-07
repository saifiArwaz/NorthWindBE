import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectFaqSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      question: z.string().min(1, "Question field is required"),
      answer: z.string().min(1, "Answer field is required"),
    })
    .superRefine(async (data, ctx) => {
      const project = await prisma.projects.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["projectId"],
          message: "Project not found",
        });
      }
    }),
});

export const updateProjectFaqSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  }),
});
