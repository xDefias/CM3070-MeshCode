import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Typography from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import EyesOffSVG from '@/assets/icons/eye-off.svg?react';
import { TermsModal } from '../modal/termsModal';
import ForgotPasswordModal from '../modal/forgotPasswordModal';

interface InputProps {
  initialValues: {
    [key: string]: string;
  };
  listOfInputs: {
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean; // Add disabled property
  }[];
  submitLabel?: string;
  onSubmit: (values: { [key: string]: any }) => void | Promise<void>;
  includeTerms?: boolean;
  termsAccepted?: boolean;
  onTermsChange?: (accepted: boolean) => void;
  submitAttempted?: boolean;
  setSubmitAttempted?: (value: boolean) => void;
  disableSubmit?: boolean;
  submitPosition?: 'right' | 'center'; // Add submitPosition property
  includeForgotPassword?: boolean; // New prop to include forgot password link
  children?: React.ReactNode;
}

export const Input = ({
  initialValues,
  listOfInputs,
  submitLabel,
  onSubmit,
  includeTerms = false,
  termsAccepted = false,
  disableSubmit = false,
  submitPosition = 'right',
  includeForgotPassword = false,
  children
}: InputProps) => {
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalContent, setTermsModalContent] = useState<'T&C' | 'Policy'>('T&C');
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  const formInitialValues = {
    ...initialValues,
    termsAndConditions: termsAccepted,
  };

  return (
    <>
      <Formik initialValues={formInitialValues} onSubmit={onSubmit}>
        {({ handleChange, values }) => (
          <Form className="space-y-4">
            {listOfInputs.map((input, index) => (
              <label key={index} htmlFor={input.name} className="flex flex-col gap-2.5 capitalize">
                {input.label && (
                  <Typography element="span" variant="body-base" className="text-white" type="tertiary">
                    {input.label}
                  </Typography>
                )}
                <div className="relative h-full w-full">
                  <Field
                    autoComplete="off"
                    name={input.name}
                    placeholder={input.placeholder}
                    type={input.type}
                    id={input.name}
                    disabled={input.disabled} // Pass the disabled property to the input field
                    className="!w-full rounded-sm border border-grey/50 bg-transparent px-3 py-3 font-tertiary text-[10px] text-white placeholder:text-grey/75 md:px-6 md:text-xs lg:w-[480px] xl:text-sm"
                  />
                  {input.type === 'password' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const target = e.currentTarget.previousElementSibling as HTMLInputElement;
                        target.type = target.type === 'password' ? 'text' : 'password';
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <EyesOffSVG className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </label>
            ))}
            {includeTerms && (
              <div className="flex items-center gap-2">
                <Typography
                  element="div"
                  variant="body-sm"
                  type="tertiary"
                  className="flex items-center gap-2 text-white"
                >
                  <Field
                    type="checkbox"
                    name="termsAndConditions"
                    checked={values.termsAndConditions}
                    onChange={handleChange}
                  />
                  <label htmlFor="termsAndConditions">
                    I agree to the &nbsp;
                    <button
                      type="button"
                      className="underline underline-offset-4 cursor-pointer bg-transparent border-none p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsModalContent('T&C');
                        setTermsModalOpen(true);
                      }}>Terms & Conditions</button>
                    &nbsp;and&nbsp;
                    <button
                      type="button"
                      className="underline underline-offset-4 cursor-pointer bg-transparent border-none p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsModalContent('Policy');
                        setTermsModalOpen(true);
                      }}>Privacy Policy</button>.
                  </label>
                </Typography>
              </div>
            )}
            {includeForgotPassword && (
              <Typography
                element="div"
                variant="body-sm"
                type="tertiary"
                className="flex justify-start md:justify-end gap-2 text-white"
              >
                <button
                  type="button"
                  className="underline underline-offset-4 cursor-pointer bg-transparent border-none p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordModalOpen(true);
                  }}>Forgot Password?</button>
              </Typography>
            )}
            {children}
            {submitLabel && (
              <div className={`flex flex-row ${submitPosition === 'center' ? 'justify-center' : 'justify-start md:justify-end'} gap-8`}>
                <Button
                  variant="leaf"
                  size="leaf"
                  type="submit"
                  font="body-base"
                  weight="bold"
                  className="bg-terminal text-white"
                  disabled={disableSubmit} // Disable the submit button
                >
                  {submitLabel}
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
      <TermsModal
        open={isTermsModalOpen}
        onOpenChange={setTermsModalOpen}
        variant={termsModalContent}
        onVariantChange={setTermsModalContent}
      />
      <ForgotPasswordModal
        open={isForgotPasswordModalOpen}
        onOpenChange={setForgotPasswordModalOpen}
      />
    </>
  );
};
