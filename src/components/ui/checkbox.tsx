"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  ...props
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/15 bg-white/5 text-transparent",
        checked && "border-orange-400 bg-orange-500 text-white",
        className,
      )}
      {...props}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}
