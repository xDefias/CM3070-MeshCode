import { windowStore } from "@/store";
import { cn } from "@/utils/cn";
import React from "react";
import { useSnapshot } from "valtio";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const windowSnapshot = useSnapshot(windowStore);

  return (
    <main
      className={cn(
        "ml-auto py-28",
        windowSnapshot.menuActive
          ? "md:w-[calc(100%-200px)]"
          : "md:w-[calc(100%-80px)]"
      )}
    >
      <div className="md:mx-20">
      {children}
      </div>
     
    </main>
  );
};
