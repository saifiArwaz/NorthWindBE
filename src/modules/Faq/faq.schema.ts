import z from "zod";
import { FaqTypes } from "../../generated/prisma/enums.js";

export const createFaqSchema = z.object({
  body: z.object({
    type: z.nativeEnum(FaqTypes, { message: "Type is required" }),
    question: z.string().min(1, "Question field is required"),
    answer: z.string().min(1, "Answer field is required"),
  }),
});

export const updateFaqSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  }),
});
