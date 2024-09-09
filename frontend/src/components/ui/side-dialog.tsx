// src/components/ui/side-dialog.tsx
import CancelSVG from '@/assets/icons/cancel.svg?react'
import { cn } from "@/utils/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

const SideDialog = DialogPrimitive.Root;

const SideDialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const SideDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-terminal/5 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
SideDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SideDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <SideDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed -right-[0%] top-0 z-50 grid h-full gap-4 bg-black/75 p-4 transition-all duration-300 ease-in-out data-[state=closed]:-right-[100%] data-[state=open]:right-[0%] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:p-10",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:text-muted-foreground absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-grey lg:hidden">
        <CancelSVG className="size-6 stroke-terminal md:size-8" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
SideDialogContent.displayName = DialogPrimitive.Content.displayName;

const SideDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SideDialogHeader.displayName = "SideDialogHeader";

const SideDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SideDialogFooter.displayName = "SideDialogFooter";

const SideDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
SideDialogTitle.displayName = DialogPrimitive.Title.displayName;

const SideDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
SideDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  SideDialog,
  SideDialogContent,
  SideDialogDescription,
  SideDialogFooter,
  SideDialogHeader,
  SideDialogTitle,
  SideDialogTrigger
};
