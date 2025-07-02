"use client";

import { createTracker } from "@offlegacy/event-tracker";
import { Toaster, toast } from "sonner";

const [Track] = createTracker({
  DOMEvents: {
    onClick: (params: { buttonId: string }, context: { userId: string }) => {
      toast.success(`${context.userId}: ${params.buttonId}`);
    },
  },
});

export function DemoButton({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" offset={100} />
      <Track.Provider initialContext={{ userId: "demo-user" }}>
        <Track.Click params={{ buttonId: "click-me" }}>
          <button
            type="button"
            className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
            onClick={() => {
              toast.success(`demo-user: click-me`);
            }}
          >
            {children}
          </button>
        </Track.Click>
      </Track.Provider>
    </>
  );
}
