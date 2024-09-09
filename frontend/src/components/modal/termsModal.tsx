import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Typography from "@/components/ui/typography";
import { cn } from "@/utils/cn";

interface TermsModalProps {
  children?: React.ReactNode;  // Making children optional
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "T&C" | "Policy";
  onVariantChange: (variant: "T&C" | "Policy") => void;
}

export const TermsModal = ({
  children = <></>,  // Provide a default value for children
  open,
  onOpenChange,
  variant,
  onVariantChange
}: TermsModalProps) => {
  const TandCContent = () => (
    <div className="p-4 text-white">
      <h2 className="text-lg font-bold">Terms and Conditions</h2>
      <p className="mt-2 text-sm">
        Please read these terms and conditions carefully before using Our Service.
        [Terms and Conditions text goes here...]
      </p>
    </div>
  );

  const PolicyContent = () => (
    <div className="p-4 text-white">
      <h2 className="text-lg font-bold">Privacy Policy</h2>
      <p className="mt-2 text-sm">
        We value your privacy and are committed to protecting your personal data.
        [Privacy Policy text goes here...]
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[90%] flex-col items-center gap-2 bg-black/75 py-12 backdrop-blur-sm md:max-w-lg md:gap-4">
        <div className="w-full max-w-lg">
          <Typography
            element="button"
            variant="body-base"
            type="secondary"
            className={cn(
              "w-1/2 border-b border-grey py-2 text-white",
              variant === "T&C" && "border-terminal text-terminal"
            )}
            onClick={() => onVariantChange("T&C")}
          >
            TERMS & CONDITIONS
          </Typography>
          <Typography
            element="button"
            variant="body-base"
            type="secondary"
            className={cn(
              "w-1/2 border-b border-grey py-2 text-white",
              variant === "Policy" && "border-terminal text-terminal"
            )}
            onClick={() => onVariantChange("Policy")}
          >
            PRIVACY POLICY
          </Typography>
        </div>
        {{
          "T&C": <TandCContent />,
          "Policy": <PolicyContent />
        }[variant]}
      </DialogContent>
    </Dialog>
  );
};
