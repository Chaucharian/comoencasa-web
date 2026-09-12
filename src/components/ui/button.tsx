"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { playCtaSound } from "@/lib/cta-sound";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        rust: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "border border-foreground/20 bg-transparent text-foreground hover:border-primary hover:text-primary",
        ghost: "hover:bg-foreground/5 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs tracking-wider uppercase",
        lg: "h-12 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  const isCta = variant !== "ghost" && variant !== "link" && size !== "icon";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      onClick={(event) => {
        if (isCta) playCtaSound();
        onClick?.(event);
      }}
    />
  );
}

export { buttonVariants };
