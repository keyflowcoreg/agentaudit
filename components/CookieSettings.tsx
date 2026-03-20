"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  type CookieCategory,
  type ConsentState,
  defaultConsent,
  getConsent,
} from "@/lib/gdpr-utils";

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

interface CategoryInfo {
  id: CookieCategory;
  label: string;
  description: string;
  locked: boolean; // `true` = always on, toggle disabled
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: "necessary",
    label: "Strictly Necessary",
    description:
      "Essential for the website to function. These cookies enable core features such as security, authentication, and accessibility. They cannot be disabled.",
    locked: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Help us understand how visitors interact with the website by collecting and reporting information anonymously (e.g. Google Analytics).",
    locked: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.",
    locked: false,
  },
  {
    id: "preferences",
    label: "Preferences",
    description:
      "Allow the website to remember choices you make (such as language, region, or display settings) and provide enhanced, personalised features.",
    locked: false,
  },
];

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  disabled,
  onChange,
  id,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
        ${checked ? "bg-emerald-500" : "bg-zinc-600"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0
          transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// CookieSettings
// ---------------------------------------------------------------------------

interface CookieSettingsProps {
  onSave: (state: ConsentState) => void;
  onClose: () => void;
}

export function CookieSettings({ onSave, onClose }: CookieSettingsProps) {
  const [state, setState] = useState<ConsentState>(() => {
    return getConsent() ?? defaultConsent();
  });

  // Close on Escape key.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggle = useCallback((cat: CookieCategory) => {
    setState((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  return (
    <motion.div
      key="cookie-settings-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Cookie Preferences
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Choose which cookie categories you allow. You can change these
            settings at any time.
          </p>
        </div>

        {/* Categories */}
        <div className="divide-y divide-zinc-800 px-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex gap-4 py-5">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`toggle-${cat.id}`}
                  className="block text-sm font-medium text-white"
                >
                  {cat.label}
                  {cat.locked && (
                    <span className="ml-2 inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Always on
                    </span>
                  )}
                </label>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {cat.description}
                </p>
              </div>
              <div className="flex items-start pt-0.5">
                <Toggle
                  id={`toggle-${cat.id}`}
                  checked={state[cat.id]}
                  disabled={cat.locked}
                  onChange={() => toggle(cat.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-800 bg-zinc-900/95 px-6 py-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(state)}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Save Preferences
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
