import React from 'react';
import { toast, ToastPosition } from 'react-toastify';

// Custom content component for toast
interface CustomToastContentProps {
    title: string;
    description: string;
}

const CustomToastContent: React.FC<CustomToastContentProps> = ({ title, description }) => (
    <div style={{ padding: '10px' }} onClick={(e) => e.stopPropagation()}>
        <strong>{title}</strong>
        <div>{description}</div>
    </div>
);

// This function is used to show toast notifications with custom content
export const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    const toastProps = {
        className: 'custom-toast',
        progressClassName: 'toast-progress-bar',
        position: "bottom-right" as ToastPosition,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    };

    if (type === 'success') {
        toast(<CustomToastContent title={title} description={description} />, toastProps);
    } else {
        toast.error(<CustomToastContent title={title} description={description} />, toastProps);
    }
};

export default showToast;
