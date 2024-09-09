// src/components/modal/editProjectModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Typography from "@/components/ui/typography";
import axiosInstance from "@/utils/axios";
import { Input } from "@/components/ui/input";
import { API_LIST } from "@/constants/api";
import showToast from "../ui/toast";
import { Project } from "@/types/project";

interface EditProjectModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  project: Project | null;
  onEdit: () => void;
}

export const EditProjectModal = (props: React.PropsWithChildren<EditProjectModalProps>) => {
  const { open, onOpenChange, project, onEdit, children } = props;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const initialValues = {
    name: project?.name || "",
    description: project?.description || "",
  };

  const handleEditProject = async (values: { [key: string]: any }) => {
    setError("");
    setSuccess(false);

    const { name, description } = values;

    if (!name) {
      setError("Please enter a project name.");
      return;
    }

    if (!description) {
      setError("Please enter a project description.");
      return;
    }

    try {
      if (project) {
        const response = await axiosInstance.put(API_LIST.UPDATE_PROJECT(project.id), { name, description });
        if (response.data.success) {
          setSuccess(true);
          showToast("Project updated successfully", `Project ${name} has been updated.`);
          onEdit();
        }
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
      name: "name",
      type: "text",
      label: "Project Name",
      placeholder: "Enter project name",
    },
    {
      name: "description",
      type: "text",
      label: "Project Description",
      placeholder: "Enter project description",
    },
  ];

  useEffect(() => {
    if (open) {
      setError("");
      setSuccess(false);
    }
  }, [open]);

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
          Edit Project
        </Typography>
        {error && (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'red' }}>
            {error}
          </Typography>
        )}
        {success ? (
          <Typography variant="body-base" type="tertiary" element="span" style={{ color: 'green' }}>
            The project has been successfully updated.
          </Typography>
        ) : (
          <Input
            initialValues={initialValues}
            listOfInputs={listOfInputs}
            submitLabel="Save Changes"
            onSubmit={handleEditProject}
            submitPosition="center"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
