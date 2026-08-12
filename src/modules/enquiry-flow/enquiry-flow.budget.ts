export interface EnquiryFlowBudgetRange {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const ENQUIRY_FLOW_BUDGET_RANGES: EnquiryFlowBudgetRange[] = [
  { key: "50l_1cr", label: "50 L - 1.00 CR", min: 5_000_000, max: 10_000_000 },
  {
    key: "1_1.5cr",
    label: "1.00 CR - 1.5 CR",
    min: 10_000_000,
    max: 15_000_000,
  },
  {
    key: "1.5_2cr",
    label: "1.5 CR - 2.00 CR",
    min: 15_000_000,
    max: 20_000_000,
  },
  {
    key: "2_2.5cr",
    label: "2.00 CR - 2.5 CR",
    min: 20_000_000,
    max: 25_000_000,
  },
  {
    key: "2.5_3cr",
    label: "2.5 CR - 3.00 CR",
    min: 25_000_000,
    max: 30_000_000,
  },
  {
    key: "3_3.5cr",
    label: "3.00 CR - 3.5 CR",
    min: 30_000_000,
    max: 35_000_000,
  },
];
