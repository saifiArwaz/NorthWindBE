import z from "zod";
import { FileType, gallerieTypes } from "../../generated/prisma/enums.js";

export const createGalleriesListSchema = z.object({
  body: z.object({
    type: z.nativeEnum(gallerieTypes, { message: "Type is required" }),
    fileType: z
      .nativeEnum(FileType, { message: "File type is required" })
      .optional(),
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    link: z.string().optional().nullable(),
  }),
});

export const updateGalleriesListSchema = z.object({
  body: z.object({
    alt: z.string().optional().nullable(),
    watermark: z.string().optional().nullable(),
    link: z.string().optional().nullable(),
  }),
});
