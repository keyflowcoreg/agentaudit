'use client';

import { useState, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EmailCaptureVariant = 'card' | 'inline';

export interface EmailCaptureProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  /** Form variant — 'card' (stacked) or 'inline' (single row) */
  variant?: EmailCaptureVariant;
  /** API endpoint to POST the email — if omitted, only localStorage is used */
  endpoint?: string;
  /** Called on successful submission */
  onSubmit?: (email: string) => void | Promise<void>;
  /** Tailwind accent color prefix — defaults to 'indigo' */
  accent?: string;
  className?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STORAGE_KEY = 'email_capture_leads';

function storeLocally(email: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(email)) {
      list.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // localStorage may be unavailable — silently ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Inline SVGs                                                        */
/* ------------------------------------------------------------------ */

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EmailCapture({
  heading = 'Stay in the loop',
  description = 'Get product updates, tips, and early access delivered to your inbox.',
  buttonText = 'Subscribe',
  variant = 'card',
  endpoint,
  onSubmit,
  accent = 'indigo',
  className = '',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const accentBtn = `bg-${accent}-600 hover:bg-${accent}-500 focus-visible:ring-${accent}-500`;
  const accentText = `text-${accent}-400`;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setErrorMsg('');

      const trimmed = email.trim();
      if (!EMAIL_RE.test(trimmed)) {
        setErrorMsg('Please enter a valid email address.');
        setStatus('error');
        return;
      }

      setStatus('submitting');

      // Always persist locally as fallback
      storeLocally(trimmed);

      try {
        // POST to endpoint if provided
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmed }),
          });
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
        }

        await onSubmit?.(trimmed);
        setStatus('success');
        setEmail('');
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err instanceof Error ? err.message : 'Something went wrong. Try again.',
        );
      }
    },
    [email, endpoint, onSubmit],
  );

  /* ---- Shared inner elements ---- */

  const successBanner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 rounded-lg bg-emerald-500/10 px-4 py-3 text-emerald-400"
    >
      <CheckIcon />
      <span className="text-sm font-medium">You&rsquo;re in! Check your inbox.</span>
    </motion.div>
  );

  const errorBanner = errorMsg && (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-xs text-red-400"
    >
      <AlertIcon />
      {errorMsg}
    </motion.div>
  );

  /* ---------------------------------------------------------------- */
  /*  Inline variant                                                   */
  /* ---------------------------------------------------------------- */

  if (variant === 'inline') {
    return (
      <div className={`w-full ${className}`}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            successBanner
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <MailIcon />
                </span>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-60 ${accentBtn}`}
              >
                {status === 'submitting' ? <SpinnerIcon /> : buttonText}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === 'error' && <div className="mt-2">{errorBanner}</div>}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Card variant (default)                                           */
  /* ---------------------------------------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-lg ${className}`}
    >
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative space-y-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accent}-500/10 ${accentText}`}>
          <MailIcon />
        </div>

        <h3 className="text-lg font-semibold text-white">{heading}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            successBanner
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <MailIcon />
                </span>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-60 ${accentBtn}`}
              >
                {status === 'submitting' ? <SpinnerIcon /> : buttonText}
              </button>
              {status === 'error' && errorBanner}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
