import z from "zod";

export const createSocialLinkSchema = z.object({
  body: z.object({
    key: z.string().min(3, "This field is required"),
    socialLink: z.string().min(3, "Social link is required"),
  }),
});

export const updateSocialLinkSchema = z.object({
  body: z.object({
    key: z.string().optional(),
    socialLink: z.string().optional(),
  }),
});
