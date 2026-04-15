import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white shadow-[0_16px_40px_-20px_rgba(255,122,24,0.9)] hover:bg-orange-400",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        outline: "border border-white/15 bg-transparent text-white hover:bg-white/5",
        ghost: "bg-transparent text-white hover:bg-white/8",
        destructive: "bg-red-500 text-white hover:bg-red-400",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
Button.displayName = "Button";

export { Button, buttonVariants };
