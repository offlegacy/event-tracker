"use client";

import { highlight, Pre, type HighlightedCode } from "codehike/code";
import { DemoButton } from "./demo-button";
import { Link, useTheme } from "nextra-theme-docs";
import { useLayoutEffect, useState } from "react";
import { motion } from "motion/react";
import { Toaster } from "sonner";

const code = `import { createTracker } from "@offlegacy/event-tracker";
import { capture } from "you-can-use-analytics";

const [Track] = createTracker({
  DOMEvents: {
    onClick: (params, context) => {
      capture("click", { ...params, ...context });
      toast.success(\`\${context.userId}: \${params.buttonId}\`);
    },
  },
});

function App() {
  return (
    <Track.Provider initialContext={{ userId: "demo-user" }}>
      <Track.Click params={{ buttonId: "click-me" }} throttle={{ delay: 1000 }}>
        <button>Click me</button>
      </Track.Click>
    </Track.Provider>
  );
}`;

export function DemoCode() {
  const { resolvedTheme } = useTheme();
  const codeTheme = resolvedTheme === "dark" ? "github-dark" : "github-light";
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

  useLayoutEffect(() => {
    highlight(
      {
        value: code,
        lang: "tsx",
        meta: "",
      },
      codeTheme,
    ).then(setHighlighted);
  }, [codeTheme]);

  if (!highlighted) return null;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 32, scale: 0.96, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8,
        delay: 0.1,
      }}
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <Link href="/docs/basic-example" className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              example-basic.tsx
            </Link>
          </div>
        </div>
        <div className="relative overflow-x-auto p-6">
          <Pre code={highlighted} className="relative z-0 !m-0 !bg-transparent !p-0 text-sm leading-relaxed" />
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-10">
        <DemoButton>Click me</DemoButton>
      </div>
      <Toaster position="top-right" className="!absolute" />
    </motion.div>
  );
}
