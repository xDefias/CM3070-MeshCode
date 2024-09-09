import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Typography from "@/components/ui/typography";
import axios from "axios";
// import axiosInstance from "@/utils/axios";
import { Input } from "@/components/ui/input";
import { API_LIST } from "@/constants/api";
import showToast from "../ui/toast";

interface ForgotPasswordModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ForgotPasswordModal = (props: React.PropsWithChildren<ForgotPasswordModalProps>) => {
  const { open, onOpenChange, children } = props;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const initialValues = {
    email: "",
  };

  const handleForgotPassword = async (values: { [key: string]: any }) => {
    setError("");
    setSuccess(false);

    const { email } = values as { email: string };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(API_LIST.FORGOTPASSWORD, { email });
      if (response.data.success) {
        setSuccess(true);
        showToast("Password reset link has been sent", `Please check your inbox ${email}`);
        onOpenChange?.(false); // Close the modal on success
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const listOfInputs = [
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email address",
    },
  ];

  // Close the modal on success after a brief delay to show the success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onOpenChange?.(false);
      }, 2000); // 2 seconds delay
      return () => clearTimeout(timer);
    }
  }, [success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="flex w-[90%] flex-col items-center gap-2 bg-black/75 py-12 backdrop-blur-sm md:max-w-lg md:gap-4">
        <Typography variant="text-lg" type="secondary" element="span" className="text-white">
        Forgot Password
        </Typography>
        {error && (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'red' }}>
            error
          </Typography>
        )}
        {success ? (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'green' }}>
            A password reset link has been sent to your email address.
          </Typography>
        ) : (
          <Input
            initialValues={initialValues}
            listOfInputs={listOfInputs}
            submitLabel="Send Reset Link"
            onSubmit={handleForgotPassword}
            submitPosition="center"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
