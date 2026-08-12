import z from "zod";
import { PartnerType } from "../../generated/prisma/enums.js";

export const createPartnersSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    title: z.string().min(3, "Name field is required"),
    alt: z.string().optional(), 
  }),
});

export const updatePartnersSchema = z.object({
  body: z.object({
    status: z.boolean().optional(),
    watermark: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
  }),
});
