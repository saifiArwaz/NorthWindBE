import z from "zod";
import { CityContentDetailTypes } from "../../generated/prisma/enums.js";

export const createcitiesContentDetailSchema = z.object({
  body: z.object({
    type: z.nativeEnum(CityContentDetailTypes, { message: "Type is required" }),
    heading: z.string().min(3, "Heading field is required"),
  }),
});

export const updatecitiesContentDetailSchema = z.object({
  body: z.object({
    heading: z.string().optional(),
  }),
});
