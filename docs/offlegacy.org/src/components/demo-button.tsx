"use client";

import { createTracker } from "@offlegacy/event-tracker";
import { toast } from "sonner";
import { motion } from "motion/react";

const [Track] = createTracker({
  DOMEvents: {
    onClick: (params: { buttonId: string }, context: { userId: string }) => {
      toast.success(`${context.userId}: ${params.buttonId}`);
    },
  },
});

export function DemoButton({ children }: { children: React.ReactNode }) {
  return (
    <Track.Provider initialContext={{ userId: "demo-user" }}>
      <Track.Click params={{ buttonId: "click-me" }} throttle={{ delay: 1000 }}>
        <motion.button
          type="button"
          className="cursor-pointer rounded-lg bg-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-blue-600"
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: 1,
            y: 0,
            boxShadow: [
              "0 4px 14px 0 rgba(59,130,246,0.25)",
              "0 6px 20px 0 rgba(59,130,246,0.40)",
              "0 4px 14px 0 rgba(59,130,246,0.25)",
            ],
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 18,
            opacity: { duration: 0.4 },
            y: { type: "spring", stiffness: 200, damping: 18 },
            scale: { repeat: Infinity, repeatType: "loop", duration: 1.8 },
            boxShadow: { repeat: Infinity, repeatType: "loop", duration: 1.8 },
          }}
          whileHover={{ scale: 1.13, boxShadow: "0 8px 32px 0 rgba(59,130,246,0.55)" }}
          whileTap={{ scale: 0.96 }}
        >
          {children}
        </motion.button>
      </Track.Click>
    </Track.Provider>
  );
}
