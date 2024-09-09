import { Input } from "@/components/ui/input";
import {
  SideDialog,
  SideDialogContent,
  SideDialogTrigger
} from "@/components/ui/side-dialog";
import Typography from "@/components/ui/typography";
import { cn } from "@/utils/cn";
import { ReactNode, useState } from "react";
import axios from 'axios';
import { API_LIST } from "@/constants/api";
import showToast from "@/components/ui/toast";
import { useAuth } from "@/contexts/authContext";

export const AuthModal = (props: {
  variant: "register" | "login";
  onVariantChange: (variant: "register" | "login") => void;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  close?: () => void;
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { setAuthToken } = useAuth();

  const handleSubmitRegister = async (values: { [key: string]: any }) => {
    if (!values.register_username) {
      showToast("Registration Failed", "Please fill in the username");
      return;
    }
    if (!values.register_email) {
      showToast("Registration Failed", "Please fill in the email");
      return;
    }
    if (!values.register_password) {
      showToast("Registration Failed", "Please fill in the password");
      return;
    }
    if (values.register_password !== values.confirm_password) {
      showToast("Registration Failed", "Passwords do not match.");
      return;
    }
    if (!values.termsAndConditions) {
      showToast("Registration Failed", "You must accept the Terms and Conditions.");
      return;
    }
    try {
      const response = await axios.post(API_LIST.REGISTER, {
        username: values.register_username,
        email: values.register_email,
        password: values.register_password,
        confirmPassword: values.confirm_password,
        referredBy: values.referral_code,
      }, {
        withCredentials: true
      });

      //console.log('register response:', response)

      if (response.data.success) {
        const token = response.data.data.token;
        if (token) {
          setAuthToken(token);
          showToast("Registration Successful", "You have successfully registered and logged in.");
          props.close?.();
        } else {
          showToast("Registration Successful", "You have successfully registered. Please log in.");
          props.onVariantChange("login");
        }
      } else {
        showToast("Registration Failed", response.data.error);
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred during registration.";
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response && error.response.status === 401) {
          errorMessage = "Unauthorized: Invalid username or password.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      showToast("Registration Failed", errorMessage);
    }
  };

  const handleSubmitLogin = async (values: { [key: string]: any }) => {
    try {
      const response = await axios.post(API_LIST.LOGIN, {
        identifier: values.login_username,
        password: values.login_password,
      }, {
        withCredentials: true
      });
      //console.log('login response:', response)

      if (response.data.success) {
        const token = response.data.data.token;
        if (token) {
          setAuthToken(token);
          showToast("Login Successful", "You have successfully logged in.");
          props.close?.();
        } else {
          showToast("Login Failed", "Login failed, no token received.");
        }
      } else {
        showToast("Login Failed", response.data.error);
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred during login.";
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response && error.response.status === 401) {
          errorMessage = "Unauthorized: Invalid username or password.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      showToast("Login Failed", errorMessage);
    }
  };

  const RegisterContent = () => {
    return (
      <div className="flex h-full w-full flex-col place-content-between overflow-y-scroll">
        <div className="space-y-8">
          <Input
            initialValues={{
              register_username: "",
              register_email: "",
              register_password: "",
              confirm_password: "",
            }}
            listOfInputs={[
              {
                name: "register_username",
                type: "text",
                placeholder: "Enter username",
                label: "Username"
              },
              {
                name: "register_email",
                type: "email",
                placeholder: "Enter email",
                label: "Email"
              },
              {
                name: "register_password",
                type: "password",
                placeholder: "Enter password",
                label: "Password"
              },
              {
                name: "confirm_password",
                type: "password",
                placeholder: "Confirm password",
                label: "Confirm Password"
              }
            ]}
            includeTerms={true}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            submitLabel="REGISTER"
            onSubmit={handleSubmitRegister}
          />
        </div>
      </div>
    );
  };

  const LoginContent = () => {
    return (
      <div className="flex h-full w-full flex-col place-content-between">
        <div className="space-y-8">
          <Input
            initialValues={{
              login_username: "",
              login_password: ""
            }}
            listOfInputs={[
              {
                name: "login_username",
                type: "text",
                placeholder: "Enter username",
                label: "Username"
              },
              {
                name: "login_password",
                type: "password",
                placeholder: "Enter password",
                label: "Password"
              }
            ]}
            includeForgotPassword={true}
            submitLabel="LOGIN"
            onSubmit={handleSubmitLogin}
          />
        </div>
      </div>
    );
  };

  return (
    <SideDialog open={props.open} onOpenChange={props.onOpenChange}>
      <SideDialogTrigger asChild>{props.children}</SideDialogTrigger>
      <SideDialogContent className="flex w-full max-w-lg flex-col items-center gap-4 bg-black lg:gap-10">
        <div className="w-full pt-6 lg:pt-0">
          <Typography
            element="button"
            variant="body-base"
            type="secondary"
            className={cn(
              "w-1/2 border-b border-grey py-2 text-white",
              props.variant === "register" && "border-terminal text-terminal"
            )}
            onClick={() => props.onVariantChange("register")}
          >
            REGISTER
          </Typography>
          <Typography
            element="button"
            variant="body-base"
            type="secondary"
            className={cn(
              "w-1/2 border-b border-grey py-2 text-white",
              props.variant === "login" && "border-terminal text-terminal"
            )}
            onClick={() => props.onVariantChange("login")}
          >
            LOGIN
          </Typography>
        </div>
        {
          {
            register: <RegisterContent />,
            login: <LoginContent />
          }[props.variant]
        }
      </SideDialogContent>
    </SideDialog>
  );
};
