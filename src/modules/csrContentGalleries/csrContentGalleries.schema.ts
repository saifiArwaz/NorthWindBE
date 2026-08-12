import { z } from "zod";
import { csrContentTypes, FileType } from "../../generated/prisma/enums.js";

export const createCsrContentGalleriesSchema = z.object({
  body: z.object({
    type: z.nativeEnum(csrContentTypes, { message: "Type is required" }),
    fileType: z.nativeEnum(FileType).optional().default(FileType.image),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    link: z.string().optional(),
    status: z.boolean().optional(),
  }),
});

export const updateCsrContentGalleriesSchema = z.object({
  body: z.object({
    type: z.nativeEnum(csrContentTypes).optional(),
    fileType: z.nativeEnum(FileType).optional(),
    alt: z.string().optional(),
    watermark: z.string().optional(),
    link: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
