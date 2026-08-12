import z from "zod";

export const createSeoFooterLinkSchema = z.object({
  body: z.object({
    label: z.string().min(1, "Label is required"),
    slug: z.string().optional(),
    type: z.enum(["PRICE", "TYPOLOGY", "LOCATION", "PROJECT"]),
    projectId: z.string().optional(),
    seq: z.preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().optional(),
    ),
  }),
});

export const updateSeoFooterLinkSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    slug: z.string().optional(),
    type: z.enum(["PRICE", "TYPOLOGY", "LOCATION", "PROJECT"]).optional(),
    projectId: z.string().optional(),
    seq: z.preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().optional(),
    ),
  }),
});
