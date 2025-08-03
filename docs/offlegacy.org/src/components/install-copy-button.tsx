"use client";

import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useState } from "react";

const COMMAND = "npm i @offlegacy/event-tracker";

export function InstallCopyButton() {
  const [, copyToClipboard] = useCopyToClipboard();
  const [showCheck, setShowCheck] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-7 py-3 text-base font-semibold shadow-sm transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-800/60 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-900"
      aria-label="Copy install command"
      onClick={() => {
        copyToClipboard(COMMAND);
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 1000);
      }}
    >
      <span className="w-full text-center font-mono text-xs">{COMMAND}</span>
      <span className="relative h-5 w-5">
        <AnimatePresence mode="wait" initial={false}>
          {showCheck ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center text-green-500 dark:text-green-400"
            >
              <Check size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.7, rotate: 30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: -30 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500"
            >
              <Copy size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
