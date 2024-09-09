import SpinnerSVG from "@/assets/icons/spinner.svg?react";

interface Props {
  rotate: boolean;
  label?: string;
}

// loading
export const Loading = ({ label }: Props) => {
  return (
    <div className="animate-fade select-none py-24 text-center transition-all duration-500 ease-in-out">
      <SpinnerSVG
        role="status"
        className="block size-12 animate-spin bg-transparent duration-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"
      />
      {label && (
        <span className="mt-2 block text-sm font-medium text-white/40">
          {label}
        </span>
      )}
    </div>
  );
};
