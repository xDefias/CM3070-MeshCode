// src/components/modal/confirmationModal.tsx
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Typography from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonLabel?: string;
    cancelButtonLabel?: string;
}

export const ConfirmationModal = (props: React.PropsWithChildren<ConfirmationModalProps>) => {
    const { open, onOpenChange, onConfirm, title, message, confirmButtonLabel = "Confirm", cancelButtonLabel = "Cancel", children } = props;

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent showCloseButton={false} className="flex flex-col items-center gap-2 bg-black/75 py-12 backdrop-blur-sm md:max-w-lg md:gap-4">
                <Typography variant="text-lg" type="secondary" element="span" className="text-white">
                    {title}
                </Typography>
                <Typography variant="body-base" type="tertiary" element="span" className="text-white">
                    {message}
                </Typography>
                <div className="flex space-x-4">
                    <Button
                        variant="leaf"
                        size="leaf"
                        type="submit"
                        font="body-base"
                        weight="bold"
                        className="bg-terminal text-white"
                        onClick={handleConfirm}>
                        {confirmButtonLabel}
                    </Button>
                    <Button
                        variant="leaf"
                        size="leaf"
                        type="submit"
                        font="body-base"
                        weight="bold"
                        className="bg-terminal text-white" 
                        onClick={() => onOpenChange(false)}>
                        {cancelButtonLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationModal;
