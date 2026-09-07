import z from "zod";

export const createInvestorAppreciationSchema = z.object({
  body: z.object({
    year: z.string().min(1, "Year is required"),
    bsp: z.string().min(1, "BSP is required"),

  }),
});

export const updateInvestorAppreciationSchema = z.object({
  body: z.object({
    year: z.string().optional(),
    bsp: z.string().optional(),
  }),
});
