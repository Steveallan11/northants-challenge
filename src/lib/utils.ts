import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatDate(value: string | number | Date | null | undefined) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeUrl(pathname: string) {
  const vercelBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const base = process.env.NEXT_PUBLIC_SITE_URL || vercelBase || "http://localhost:3000";
  return new URL(pathname, base).toString();
}
