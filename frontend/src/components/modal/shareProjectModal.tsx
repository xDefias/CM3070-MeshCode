import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Typography from "@/components/ui/typography";
import axiosInstance from "@/utils/axios";
import { Input } from "@/components/ui/input";
import { API_LIST } from "@/constants/api";
import showToast from "../ui/toast";

interface ShareProjectModalProps {
  project_id: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onShare: () => void;
}

export const ShareProjectModal = (props: React.PropsWithChildren<ShareProjectModalProps>) => {
  const { project_id, open, onOpenChange, onShare, children } = props;
  const [error, setError] = useState("");  // State to track error message
  const [success, setSuccess] = useState(false);  // State to track success message

  const initialValues = {
    identifier: "",  // The input value for either userId or username
  };

  // Function to handle sharing the project
  const handleShareProject = async (values: { [key: string]: any }) => {
    setError("");  // Reset the error before submitting
    setSuccess(false);  // Reset success before submitting

    const { identifier } = values;

    if (!identifier.trim()) {
      setError("Please enter a valid user ID or username.");
      return;
    }

    try {
      // Send the identifier (userId or username) to the backend
      const response = await axiosInstance.post(API_LIST.SHARE_PROJECT(project_id), { identifier });

      if (response.data.success) {
        setSuccess(true);
        showToast("Project shared successfully", `Project has been shared with ${identifier}.`);
        onShare();  // Call onShare callback
      }
    } catch (err: any) {
      //console.log('error:', err);  // For debugging purposes
      if (err.response && err.response.data) {
        // Display the specific error message from the backend
        const errorMessage = err.response.data.message || err.response.data.error || "An unexpected error occurred.";
        setError(errorMessage);
        showToast("Project sharing failed", errorMessage);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };




  // Input fields for the form
  const listOfInputs = [
    {
      name: "identifier",
      type: "text",
      label: "User ID or Username",
      placeholder: "Enter user ID or username to share with",
    },
  ];

  // Reset error and success state when modal is opened
  useEffect(() => {
    if (open) {
      setError("");
      setSuccess(false);
    }
  }, [open]);

  // Close modal after 2 seconds of showing success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onOpenChange?.(false);
      }, 2000);  // Delay closing modal for 2 seconds
      return () => clearTimeout(timer);  // Cleanup timeout
    }
  }, [success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="flex w-[90%] flex-col items-center gap-2 bg-black/75 py-12 backdrop-blur-sm md:max-w-lg md:gap-4">
        <Typography variant="text-lg" type="secondary" element="span" className="text-white">
          Share Project
        </Typography>

        {/* Display error message if any */}
        {error && (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'red' }}>
            {error}
          </Typography>
        )}

        {/* Display success message if the project was shared successfully */}
        {success && (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'green' }}>
            The project has been successfully shared.
          </Typography>
        )}

        {/* Show input form if there is no success */}
        {!success && (
          <Input
            initialValues={initialValues}
            listOfInputs={listOfInputs}
            submitLabel="Share Project"
            onSubmit={handleShareProject}
            submitPosition="center"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareProjectModal;
