import z from "zod";
import { prisma } from "../../config/prisma.config.js";
import { InvestorDocumentType } from "../../generated/prisma/enums.js";
export const createinvestorDocumentschema = z.object({
  body: z
    .object({
      title: z.string().min(1, "Title is required"),
      type: z.nativeEnum(InvestorDocumentType).optional(),
      dateAt: z.preprocess(
        (val) =>
          typeof val === "string" || typeof val === "number"
            ? new Date(val)
            : val,
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Invalid date format",
        }),
      ).optional(),
    })
});

export const updateinvestorDocumentschema = z.object({
  body: z.object({
    title: z.string().optional(),
    type: z.nativeEnum(InvestorDocumentType).optional(),
    dateAt: z.preprocess(
      (val) =>
        typeof val === "string" || typeof val === "number"
          ? new Date(val)
          : val,
      z.date().refine((d) => !isNaN(d.getTime()), {
        message: "Invalid date format",
      }),
    ).optional(),
  }),
});
