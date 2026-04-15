import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/20",
      secondary: "bg-white/10 text-slate-100 ring-1 ring-white/10",
      success: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
