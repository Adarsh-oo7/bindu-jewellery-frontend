import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function normalizeGrams(val) {
  if (!val) return 0;
  let num = parseFloat(val);
  if (isNaN(num)) return 0;
  // If the value is unrealistically high for grams (e.g. > 1000), 
  // it is likely legacy INR data. Convert it to grams.
  if (num > 1000) {
    return num / 7500;
  }
  return num;
}

export function formatGrams(val, decimals = 1) {
  return normalizeGrams(val).toLocaleString('en-IN', { maximumFractionDigits: decimals });
}
