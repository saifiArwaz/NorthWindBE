export const BUDGET_RANGES = [
  { key: "50l_1cr", label: "50 L - 1.00 Cr", min: 5000000, max: 10000000 },
  { key: "1_1_5cr", label: "1.00 Cr - 1.5 Cr", min: 10000000, max: 15000000 },
  { key: "1_5_2cr", label: "1.5 Cr - 2.00 Cr", min: 15000000, max: 20000000 },
  { key: "2_2_5cr", label: "2.00 Cr - 2.5 Cr", min: 20000000, max: 25000000 },
  { key: "2_5_3cr", label: "2.5 Cr - 3.00 Cr", min: 25000000, max: 30000000 },
  { key: "3_3_5cr", label: "3.00 Cr - 3.5 Cr", min: 30000000, max: 35000000 },
  { key: "above_5cr", label: "Above 5 Cr", min: 50000000, max: null },
];

// export function formatPrice(price: bigint) {
//   const value = Number(price);

//   if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
//   if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`;
//   if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
//   return `₹${value}`;
// }
