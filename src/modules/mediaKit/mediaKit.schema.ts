import z from "zod";
import { MediaKitType } from "../../generated/prisma/enums.js";

export const createMediaKitSchema = z.object({
  body: z.object({
    link: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    type: z.nativeEnum(MediaKitType, "Type is required",),
    watermark: z.string().optional(),
  }),
});

export const updateMediaKitSchema = z.object({
  body: z.object({
    link: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    type: z.nativeEnum(MediaKitType).optional(),
    watermark: z.string().optional(),
    status: z.boolean().optional(),
  }),
});
