import z from "zod";
import { FileType } from "../../generated/prisma/enums.js";
import { prisma } from "../../config/prisma.config.js";

export const createProjectSchema = z
  .object({
    body: z.object({
      projectName: z.string(),
      platterId: z.string(),
      typologyId: z.string().optional(),
      subTypologyId: z.array(z.string()).optional(),
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

    // check locality
    // const locality = await prisma.locality.findUnique({
    //   where: { id: body.localityId },
    // });
    // if (!locality) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: "Invalid localityId",
    //     path: ["body", "localityId"],
    //   });
    // }

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

    // Check if Typology exists
    if (body.typologyId) {
      const typology = await prisma.typology.findUnique({
        where: { id: body.typologyId },
      });

      if (!typology) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid typologyId",
          path: ["body", "typologyId"],
        });
      }
    }

        //check if subtypology exists
          if (body.subTypologyId && body.subTypologyId.length > 0) {
               const subTypologies = await prisma.subTypology.findMany({
                    where: {
                         id: {
                              in: body.subTypologyId,
                         },
                    },
               });
               if (subTypologies.length !== body.subTypologyId.length) {
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
    typologyId: z.string().optional(),
    subTypologyId: z.array(z.string()).optional(),
    projectStatusId: z.string().optional(),
    cityId: z.string().optional(),
    brochure: z.string().optional(),
    type: z.string().optional(),
    shortDescription: z.string().optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    location: z.string().optional(),
    seoTags: z.record(z.string(), z.unknown()).optional(),
    otherDetails: z.record(z.string(), z.unknown()).optional(),
  }),
});
