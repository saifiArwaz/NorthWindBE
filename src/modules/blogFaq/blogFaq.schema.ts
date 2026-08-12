import z from "zod";
import { prisma } from "../../config/prisma.config.js";

export const createBlogFaqSchema = z.object({
  body: z
    .object({
      blogId: z.string().min(1, "Blog Id field is required"),
      question: z.string().min(1, "Question field is required"),
      answer: z.string().min(1, "Answer field is required"),
    })
    .superRefine(async (data, ctx) => {
      const blog = await prisma.blogs.findUnique({
        where: { id: data.blogId },
      });

      if (!blog) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["blogId"],
          message: "Blog not found",
        });
      }
    }),
});

export const updateBlogFaqSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  }),
});
