import { cn } from "@/utils/cn";
import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const typographyVariants = cva("font-normal", {
  variants: {
    variant: {
      "text-8xl": "text-6xl md:text-7xl xl:text-8xl", // 96px
      "text-7xl": "text-5xl md:text-6xl xl:text-7xl", // 72px
      "text-5xl": "text-3xl md:text-4xl xl:text-5xl", // 48px
      "text-3xl": "text-2xl md:text-3xl xl:text-4xl", // 36px
      "text-2xl": "text-lg md:text-xl xl:text-2xl", // 24px
      "text-xl": "text-base md:text-lg xl:text-xl", // 20px
      "text-lg": "text-sm md:text-base xl:text-lg", // 18px
      "body-base": "text-xs md:text-sm xl:text-base", // 16px
      "body-sm": "text-[10px] md:text-xs xl:text-sm", // 14px
      "body-xs": "text-[8px] md:text-[10px] xl:text-xs" // 12px
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      "semi-bold": "font-semibold",
      bold: "font-bold"
    },
    type: {
      primary: "font-primary",
      secondary: "font-secondary",
      tertiary: "font-tertiary"
    }
  },
  defaultVariants: {
    weight: "normal",
    variant: "body-base",
    type: "primary"
  }
});

type Element = keyof JSX.IntrinsicElements;

type TypographyProps<T extends Element> = {
  element: T;
} & VariantProps<typeof typographyVariants> &
  React.HTMLAttributes<HTMLElement>;

const Typography = React.forwardRef<HTMLElement, TypographyProps<Element>>(
  (
    {
      className,
      element,
      weight,
      type,
      variant,
      ...props
    }: TypographyProps<Element>,
    ref
  ) => {
    const Component = element;

    // if the element is a button, we need to add the type attribute
    const isButton = element === "button";

    const componentProps = {
      ref,
      className: cn(typographyVariants({ weight, variant, type }), className),
      ...(isButton ? { type: "button" } : {}),
      ...props
    };

    return React.createElement(Component, componentProps);
  }
);

Typography.displayName = "Typography";

export default Typography;
