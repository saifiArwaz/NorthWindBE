import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createProjectSchema = z
  .object({
    body: z.object({
      projectName: z.string(),
      platterId: z.string(),
      typologyId: z.string().optional().nullable(),
      subTypologyId: z.union([z.array(z.string()), z.string()]).optional().nullable(),
      projectStatusId: z.string(),
      cityId: z.string().optional(),
      brochure: z.string().optional(),
      type: z.string().optional(),
      shortDescription: z.string().optional(),
      alt: z.string().optional(),
      watermark: z.string().optional(),
      location: z.string().optional(),
      seoTags: z
        .record(z.string(), z.unknown())
        .refine((val) => Object.keys(val).length > 0, {
          message: "SEO tags are required",
        }),
      otherDetails: z.record(z.string(), z.unknown()).optional(),
    }),
  })
  .superRefine(async (data, ctx) => {
    const body = data.body;
    if (body.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: body.cityId },
      });
      if (!city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid cityId",
          path: ["body", "cityId"],
        });
      }
    }

    // Check if Platter exists
    const platter = await prisma.platter.findUnique({
      where: { id: body.platterId },
    });
    if (!platter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid platterId",
        path: ["body", "platterId"],
      });
    }

    // Check if Typology exists (only if non-empty string)
    if (body.typologyId && body.typologyId.trim() !== "") {
      const typology = await prisma.typology.findUnique({
        where: { id: body.typologyId.trim() },
      });

      if (!typology) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid typologyId",
          path: ["body", "typologyId"],
        });
      }
    }

    // Check if subtypology exists (filter out empty strings)
    const rawSubIds = Array.isArray(body.subTypologyId)
      ? body.subTypologyId
      : body.subTypologyId
      ? [body.subTypologyId]
      : [];
    const subIds = rawSubIds.filter((id) => typeof id === "string" && id.trim() !== "");

    if (subIds.length > 0) {
      const subTypologies = await prisma.subTypology.findMany({
        where: {
          id: {
            in: subIds,
          },
        },
      });
      if (subTypologies.length !== subIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "One or more subTypologyIds are invalid",
          path: ["body", "subTypologyId"],
        });
      }
    }

    // Check if Status exists
    const status = await prisma.projectStatus.findUnique({
      where: { id: body.projectStatusId },
    });
    if (!status) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid statusId",
        path: ["body", "statusId"],
      });
    }
  });

export const updateProjectSchema = z.object({
  body: z.object({
    projectName: z.string().optional(),
    platterId: z.string().optional(),
    typologyId: z.string().optional().nullable(),
    subTypologyId: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    projectStatusId: z.string().optional(),
    cityId: z.string().optional(),
    brochure: z.string().optional(),
    type: z.string().optional(),
    shortDescription: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    location: z.string().optional(),
    isPastProject: z.preprocess(
      (val) => val === "true" || val === true || val === 1 || val === "1",
      z.boolean().optional(),
    ),
    seoTags: z.record(z.string(), z.unknown()).optional(),
    otherDetails: z.record(z.string(), z.unknown()).optional(),
  }),
});
