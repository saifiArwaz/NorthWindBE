import z from "zod";

export const createInstagramReelSchema = z.object({
  body: z.object({
    reelId: z.string().min(1, "Reel Id is required"),
    thumbnail_url: z.string().optional(),
    isDisplay: z.union([z.boolean(), z.string()]).optional(),
  }),
});

export const updateInstagramReelSchema = z.object({
  body: z.object({
    reelId: z.string().optional(),
    thumbnail_url: z.string().optional(),
  }),
});
