import z from "zod";
import { csrContentTypes } from "../../generated/prisma/enums.js";

export const createcsrContentDetailSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title field is required"),
  }),
});

export const updatecsrContentDetailSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});
