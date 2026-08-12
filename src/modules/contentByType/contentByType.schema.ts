import z from "zod";
import { FileType } from "../../generated/prisma/enums.js";

export const createContentByTypeSchema = z.object({
  body: z.object({
    type: z.string().min(1, "Type is required"),
    title: z.any().refine((val) => val !== undefined, "Title is required"),
    description: z.any().optional(),
    files: z.any().optional(),
    alt: z.string().optional(),
    list: z.any().optional(),
    status: z.boolean().optional().default(true),
  }),
});

export const updateContentByTypeSchema = z.object({
  body: z.object({
    type: z.string().optional(),
    alt: z.string().optional(),
    title: z.any().optional(),
    description: z.any().optional(),
    files: z.any().optional(),
    list: z.any().optional(),
  }),
});
