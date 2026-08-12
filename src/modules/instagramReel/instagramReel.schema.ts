import z from "zod";

export const createInstagramReelSchema = z.object({
  body: z.object({
    reelId: z.string().min(1, "Reel Id is required"),
  }),
});

export const updateInstagramReelSchema = z.object({
  body: z.object({
    reelId: z.string().optional(),
  }),
});
