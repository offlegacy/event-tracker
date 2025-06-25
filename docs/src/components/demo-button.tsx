"use client";

import { Toaster, toast } from "sonner";

export function DemoButton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" offset={100} />
      <button
        type="button"
        className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
        onClick={() => {
          toast.success(`demo-user: click-me`);
        }}
      >
        {children}
      </button>
    </>
  );
}
