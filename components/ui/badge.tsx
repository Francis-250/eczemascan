import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300 dark:focus:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-neutral-800 dark:text-slate-50 dark:hover:bg-neutral-800/80",
        destructive: "border-transparent bg-red-600 text-slate-50 hover:bg-red-600/80 dark:bg-red-600 dark:text-slate-50 dark:hover:bg-red-600/80",
        outline: "text-slate-900 border-slate-300 dark:border-neutral-700 dark:text-slate-50",
        success: "border-transparent bg-green-600 text-slate-50 hover:bg-green-600/80 dark:bg-green-600 dark:text-slate-50 dark:hover:bg-green-600/80",
        warning: "border-transparent bg-yellow-600 text-slate-50 hover:bg-yellow-600/80 dark:bg-yellow-600 dark:text-slate-50 dark:hover:bg-yellow-600/80",
        info: "border-transparent bg-blue-600 text-slate-50 hover:bg-blue-600/80 dark:bg-blue-600 dark:text-slate-50 dark:hover:bg-blue-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}

export { Badge, badgeVariants };