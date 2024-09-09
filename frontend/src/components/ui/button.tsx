import { cn } from "@/utils/cn";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center whitespace-nowrap justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "font-secondary rounded-lg text-base",
        leaf: "bg-black font-secondary rounded-tl-xl rounded-br-xl text-base",
        submission:
          "font-tertiary rounded-lg text-base w-full text-white bg-black hover:bg-black/80"
      },
      size: {
        default: "px-6 py-4",
        leaf: "px-4 py-1",
        submission: "px-4 py-3",
        small: "px-2.5 py-2"
      },
      state: {
        active: "bg-black text-background border border-transparent",
        inactive:
          "border-black border text-black bg-transparent hover:bg-black hover:text-white"
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        "semi-bold": "font-semibold",
        bold: "font-bold"
      },
      font: {
        "text-5xl": "text-3xl md:text-4xl xl:text-5xl", // 48px
        "text-2xl": "text-lg md:text-xl xl:text-2xl", // 24px
        "text-xl": "text-base md:text-lg xl:text-xl", // 20px
        "text-lg": "text-sm md:text-base xl:text-lg", // 18px
        "body-base": "text-xs md:text-sm xl:text-base", // 16px
        "body-sm": "text-[10px] md:text-xs xl:text-sm", // 14px
        "body-xs": "text-[8px] md:text-[10px] xl:text-xs" // 12px
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      state,
      font,
      type,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const slotProps = asChild ? { ref, ...props } : {};

    return (
      <Comp
        type={type}
        className={cn(
          buttonVariants({ variant, weight, size, state, font, className })
        )}
        ref={ref}
        {...(asChild ? slotProps : props)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
