"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type ConsentState,
  defaultConsent,
  getConsent,
  setConsent,
} from "@/lib/gdpr-utils";
import { CookieSettings } from "./CookieSettings";

// ---------------------------------------------------------------------------
// CookieBanner
// ---------------------------------------------------------------------------

/**
 * GDPR cookie consent banner.
 *
 * Renders at the bottom of the viewport and auto-hides once the user makes a
 * choice.  It can be re-opened programmatically by dispatching a custom
 * `open-cookie-banner` event on `window` (useful for a "Cookie Settings" link
 * in the footer).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ------ lifecycle ------
  useEffect(() => {
    // Show banner only when there is no stored consent.
    if (!getConsent()) setVisible(true);

    // Allow re-opening from anywhere (e.g. footer link).
    const handleOpen = () => setVisible(true);
    window.addEventListener("open-cookie-banner", handleOpen);
    return () => window.removeEventListener("open-cookie-banner", handleOpen);
  }, []);

  // ------ handlers ------
  const acceptAll = useCallback(() => {
    const state: ConsentState = {
      ...defaultConsent(),
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setConsent(state);
    setVisible(false);
    setShowSettings(false);
  }, []);

  const rejectAll = useCallback(() => {
    setConsent(defaultConsent());
    setVisible(false);
    setShowSettings(false);
  }, []);

  const handleSaveSettings = useCallback((state: ConsentState) => {
    setConsent(state);
    setVisible(false);
    setShowSettings(false);
  }, []);

  // ------ render ------
  return (
    <>
      <AnimatePresence>
        {visible && !showSettings && (
          <motion.div
            key="cookie-banner"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-[9999] border-t border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:p-6"
            role="dialog"
            aria-label="Cookie consent"
          >
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* copy */}
              <div className="max-w-2xl space-y-1 text-sm leading-relaxed text-zinc-300">
                <p className="font-semibold text-white">
                  We value your privacy
                </p>
                <p>
                  We use cookies to improve your experience, analyse traffic,
                  and personalise content. You can accept all cookies, reject
                  non-essential ones, or customise your preferences.
                </p>
              </div>

              {/* actions */}
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={rejectAll}
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                >
                  Customize
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <CookieSettings
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
