import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createBlogCategoriesSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});

export const updateBlogCategoriesSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name field is required"),
  }),
});
