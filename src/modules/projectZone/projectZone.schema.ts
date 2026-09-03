import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectZoneSchema = z.object({
  body: z
    .object({
      projectId: z.string().min(1, "Project Id field is required"),
      name: z.string().min(1, "Name field is required"),
      title: z.string().optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      list: z.any().optional(),
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
      } else {
        const existingZone = await prisma.projectZone.findFirst({
          where: {
            projectId: data.projectId,
            name: { equals: data.name.trim(), mode: "insensitive" },
            isDeleted: false,
          },
        });

        if (existingZone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["name"],
            message: "A zone with this name already exists for this project",
          });
        }
      }
    }),
});

export const updateProjectZoneSchema = z
  .object({
    params: z
      .object({
        id: z.string().optional(),
      })
      .optional(),
    body: z.object({
      projectId: z.string().optional(),
      name: z.string().optional(),
      title: z.string().optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      list: z.any().optional(),
    }),
  })
  .superRefine(async (data, ctx) => {
    const zoneId = data.params?.id;
    let currentProjectId = data.body.projectId;

    if (zoneId) {
      const existingRecord = await prisma.projectZone.findUnique({
        where: { id: zoneId },
      });
      if (existingRecord && !currentProjectId) {
        currentProjectId = existingRecord.projectId;
      }
    }

    // Only validate project if projectId is provided
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

    // Validate duplicate name in the project
    if (data.body.name && currentProjectId) {
      const existingZone = await prisma.projectZone.findFirst({
        where: {
          projectId: currentProjectId,
          name: { equals: data.body.name.trim(), mode: "insensitive" },
          isDeleted: false,
          NOT: zoneId ? { id: zoneId } : undefined,
        },
      });

      if (existingZone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "name"],
          message: "A zone with this name already exists for this project",
        });
      }
    }
  });

