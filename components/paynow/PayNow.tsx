'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WALLET = '0xCc97e4579eeE0281947F15B027f8Cad022933d7e'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckoutStep = 'methods' | 'usdc-send' | 'usdc-verify' | 'success' | 'error'
type LoadingTarget = 'stripe' | 'verify' | null

export interface PayNowProps {
  productName: string
  price: number
  description: string
  onSuccess?: () => void
  accentColor?: string
  stripeLink?: string
  stripeApiRoute?: string
  coinbaseCommerceUrl?: string
  verifyRoute?: string
}

// ---------------------------------------------------------------------------
// Micro-components (icons, badges, spinner)
// ---------------------------------------------------------------------------

function Spinner({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="3" />
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function AnimatedCheckmark() {
  return (
    <motion.svg
      width="48" height="48" viewBox="0 0 48 48" fill="none"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
    >
      <motion.circle
        cx="24" cy="24" r="22" stroke="#10b981" strokeWidth="3" fill="#10b981" fillOpacity={0.12}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.polyline
        points="15 25 22 32 33 18" stroke="#10b981" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      />
    </motion.svg>
  )
}

function NetworkBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-md"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {name}
    </span>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors min-h-[44px] -ml-1 px-1"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 4l-4 4 4 4" />
      </svg>
      Back
    </button>
  )
}

// ---------------------------------------------------------------------------
// Slide transition variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

const slideTransition = { type: 'tween' as const, duration: 0.22, ease: 'easeInOut' as const }

// ---------------------------------------------------------------------------
// PayNow
// ---------------------------------------------------------------------------

export function PayNow({
  productName,
  price,
  description,
  onSuccess,
  accentColor = '#10b981',
  stripeLink,
  stripeApiRoute,
  coinbaseCommerceUrl,
  verifyRoute = '/api/verify-payment',
}: PayNowProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('methods')
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState<LoadingTarget>(null)
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const hasStripe = !!(stripeLink || stripeApiRoute)

  // ---- Stripe success detection (redirect back from hosted checkout) ----
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setOpen(true)
      setStep('success')
      onSuccess?.()
    }
  }, [onSuccess])

  // ---- Focus tx hash input when verify step appears ----
  useEffect(() => {
    if (step === 'usdc-verify') {
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [step])

  // ---- Lock body scroll when modal is open ----
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // ---- Navigation helpers ----
  const goTo = useCallback((next: CheckoutStep, dir: 1 | -1 = 1) => {
    setDirection(dir)
    setError('')
    setStep(next)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    // Reset state after close animation finishes
    setTimeout(() => {
      if (step !== 'success') {
        setStep('methods')
        setTxHash('')
        setError('')
        setLoading(null)
      }
    }, 300)
  }, [step])

  // ---- Stripe checkout ----
  const handleStripeCheckout = async () => {
    if (stripeLink) {
      setLoading('stripe')
      window.location.href = stripeLink
      return
    }
    if (stripeApiRoute) {
      setLoading('stripe')
      try {
        const res = await fetch(stripeApiRoute, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName, price }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        }
      } catch {
        setLoading(null)
        setError('Failed to start checkout. Please try again.')
      }
    }
  }

  // ---- Coinbase Commerce ----
  const handleCoinbaseCheckout = () => {
    if (coinbaseCommerceUrl) {
      window.open(coinbaseCommerceUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // ---- Verify USDC tx ----
  const handleVerifyTx = async () => {
    const hash = txHash.trim()
    if (!hash) { setError('Enter your transaction hash'); return }
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      setError('Invalid format. Must start with 0x followed by 64 hex characters.')
      return
    }

    setLoading('verify')
    setError('')

    try {
      const res = await fetch(verifyRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: hash,
          expectedAmount: price,
          expectedWallet: WALLET,
        }),
      })
      const data = await res.json()
      if (data.verified) {
        goTo('success')
        onSuccess?.()
      } else {
        setLoading(null)
        setError(data.error || 'Could not verify. Check the hash and try again.')
      }
    } catch {
      setLoading(null)
      setError('Verification failed. Please retry or contact support.')
    }
  }

  // ---- Copy wallet ----
  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ---- Format price ----
  const fmtPrice = `$${price}`

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <>
      {/* ---- Buy Button ---- */}
      <button onClick={() => setOpen(true)} className="w-full group">
        <div
          className="relative w-full rounded-xl py-3.5 px-6 font-semibold text-center text-black overflow-hidden transition-all duration-200 group-hover:shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <span className="relative z-10">Buy {productName} — {fmtPrice}</span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white" />
        </div>
      </button>

      {/* ---- Modal ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeModal}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />

            {/* Panel - full-screen sheet on mobile, centered card on desktop */}
            <motion.div
              className="relative w-full sm:max-w-md sm:mx-4 bg-zinc-950 sm:bg-zinc-950/95 border-t sm:border border-zinc-800 sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95dvh] sm:max-h-[85vh]"
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ boxShadow: `0 0 120px -30px ${accentColor}20` }}
            >
              {/* Accent bar */}
              <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />

              {/* Mobile drag indicator */}
              <div className="sm:hidden flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[calc(95dvh-2px)] sm:max-h-[calc(85vh-2px)]">
                <div className="px-5 pt-4 pb-6 sm:p-6">

                  {/* Close button */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={closeModal}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-colors min-h-[44px] min-w-[44px]"
                      aria-label="Close"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l12 12M13 1L1 13" />
                      </svg>
                    </button>
                  </div>

                  {/* Product card (shown on methods step + success) */}
                  {(step === 'methods' || step === 'success') && (
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-white leading-tight">{productName}</h3>
                      <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">{description}</p>
                      <div className="mt-4 inline-flex items-baseline gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
                        <span className="text-3xl font-bold text-white tracking-tight">{fmtPrice}</span>
                        <span className="text-sm text-zinc-500 font-medium">USD</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-2">One-time payment</p>
                    </div>
                  )}

                  {/* Animated step content */}
                  <AnimatePresence mode="wait" custom={direction}>
                    {/* ======= STEP: Method Selection ======= */}
                    {step === 'methods' && (
                      <motion.div
                        key="methods"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={slideTransition}
                      >
                        <p className="text-sm text-zinc-400 mb-3 font-medium">Choose payment method</p>

                        <div className="space-y-2.5">
                          {/* -- Card / Apple Pay -- */}
                          {hasStripe && (
                            <button
                              onClick={handleStripeCheckout}
                              disabled={loading === 'stripe'}
                              className="w-full flex items-center gap-4 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 p-4 transition-all duration-150 group/card min-h-[72px] text-left disabled:opacity-60"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                  <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover/card:text-white">
                                  {loading === 'stripe' ? (
                                    <span className="flex items-center gap-2"><Spinner size={14} /> Redirecting...</span>
                                  ) : (
                                    'Card / Apple Pay'
                                  )}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">Visa, Mastercard, Google Pay</div>
                              </div>
                              <ChevronRight />
                            </button>
                          )}

                          {/* -- USDC Stablecoin -- */}
                          <button
                            onClick={() => goTo('usdc-send')}
                            className="w-full flex items-center gap-4 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 p-4 transition-all duration-150 group/card min-h-[72px] text-left"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="1.8" />
                                <path d="M12 6v12M15 9.5c-.5-1-1.5-1.5-3-1.5s-3 .5-3 2 1.5 2 3 2 3 .5 3 2-1 2-3 2-2.5-.5-3-1.5" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white">USDC Stablecoin</div>
                              <div className="text-xs text-zinc-500 mt-0.5">Revolut, Coinbase, MetaMask</div>
                            </div>
                            <ChevronRight />
                          </button>

                          {/* -- Coinbase Commerce -- */}
                          {coinbaseCommerceUrl && (
                            <button
                              onClick={handleCoinbaseCheckout}
                              className="w-full flex items-center gap-4 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900 p-4 transition-all duration-150 group/card min-h-[72px] text-left"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <circle cx="10" cy="10" r="9" stroke="#2563eb" strokeWidth="1.8" />
                                  <circle cx="10" cy="10" r="4" stroke="#2563eb" strokeWidth="1.8" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white">Coinbase</div>
                                <div className="text-xs text-zinc-500 mt-0.5">Pay with Coinbase app</div>
                              </div>
                              <ChevronRight />
                            </button>
                          )}
                        </div>

                        {/* Trust footer */}
                        <div className="mt-6 pt-4 border-t border-zinc-800/60 space-y-2">
                          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            Secure checkout &middot; Instant delivery
                          </div>
                          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                            Powered by Stripe &amp; USDC
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ======= STEP: USDC Send ======= */}
                    {step === 'usdc-send' && (
                      <motion.div
                        key="usdc-send"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={slideTransition}
                      >
                        <BackButton onClick={() => goTo('methods', -1)} />

                        <div className="mt-2 mb-5 text-center">
                          <p className="text-lg font-bold text-white">Send {fmtPrice} USDC</p>
                        </div>

                        {/* Wallet address */}
                        <div className="mb-4">
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">To this address</p>
                          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                            <code className="flex-1 text-xs text-cyan-400 font-mono break-all select-all leading-relaxed">
                              {WALLET}
                            </code>
                            <button
                              onClick={handleCopy}
                              className="shrink-0 text-xs font-semibold rounded-lg px-3 min-h-[36px] min-w-[60px] border transition-all duration-200"
                              style={
                                copied
                                  ? { borderColor: '#10b981', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)' }
                                  : { borderColor: '#3f3f46', color: '#a1a1aa' }
                              }
                            >
                              {copied ? (
                                <span className="flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  Copied
                                </span>
                              ) : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Networks */}
                        <div className="mb-4">
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Network</p>
                          <div className="flex flex-wrap gap-2">
                            <NetworkBadge name="Base" color="#3b82f6" />
                            <NetworkBadge name="Ethereum" color="#818cf8" />
                            <NetworkBadge name="Polygon" color="#a78bfa" />
                          </div>
                        </div>

                        {/* Works with */}
                        <div className="mb-6">
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Works with</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-zinc-300">
                            <span className="font-medium">Revolut</span>
                            <span className="text-zinc-700">&middot;</span>
                            <span className="font-medium">Coinbase</span>
                            <span className="text-zinc-700">&middot;</span>
                            <span className="font-medium">MetaMask</span>
                            <span className="text-zinc-700">&middot;</span>
                            <span className="text-zinc-400 text-xs">Any USDC wallet</span>
                          </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-4"
                            >
                              <div className="rounded-lg border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                                {error}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* CTA */}
                        <button
                          onClick={() => goTo('usdc-verify')}
                          className="w-full rounded-xl py-3.5 text-center font-semibold text-black transition-all duration-200 hover:brightness-110 min-h-[48px]"
                          style={{ backgroundColor: accentColor }}
                        >
                          I've sent the payment
                        </button>
                      </motion.div>
                    )}

                    {/* ======= STEP: USDC Verify ======= */}
                    {step === 'usdc-verify' && (
                      <motion.div
                        key="usdc-verify"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={slideTransition}
                      >
                        <BackButton onClick={() => goTo('usdc-send', -1)} />

                        <div className="mt-2 mb-5 text-center">
                          <p className="text-lg font-bold text-white">Verify your payment</p>
                        </div>

                        {/* Tx hash input */}
                        <div className="mb-4">
                          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2 block">
                            Transaction hash
                          </label>
                          <input
                            ref={inputRef}
                            type="text"
                            value={txHash}
                            onChange={(e) => { setTxHash(e.target.value); setError('') }}
                            placeholder="0x..."
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3.5 text-sm text-white font-mono placeholder:text-zinc-700 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-colors min-h-[48px]"
                            spellCheck={false}
                            autoComplete="off"
                          />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-4"
                            >
                              <div className="rounded-lg border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                                {error}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* CTA */}
                        <button
                          onClick={handleVerifyTx}
                          disabled={loading === 'verify'}
                          className="w-full rounded-xl py-3.5 text-center font-semibold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 min-h-[48px]"
                          style={{ backgroundColor: accentColor }}
                        >
                          {loading === 'verify' ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner size={16} color="#000" />
                              Verifying on-chain...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              Verify Payment
                            </span>
                          )}
                        </button>

                        {/* Help links */}
                        <div className="mt-4 text-center text-xs text-zinc-600">
                          <span>Find your tx hash on </span>
                          <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-cyan-400 underline underline-offset-2 transition-colors">basescan.org</a>
                          <span> &middot; </span>
                          <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-cyan-400 underline underline-offset-2 transition-colors">etherscan.io</a>
                        </div>
                      </motion.div>
                    )}

                    {/* ======= STEP: Success ======= */}
                    {step === 'success' && (
                      <motion.div
                        key="success"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={slideTransition}
                        className="text-center py-4"
                      >
                        <div className="flex justify-center mb-4">
                          <AnimatedCheckmark />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1.5">Payment Verified!</h4>
                        <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
                          Thank you for your purchase. Your access has been activated.
                        </p>
                        <button
                          onClick={() => { closeModal(); onSuccess?.() }}
                          className="rounded-xl px-8 py-3 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 min-h-[48px]"
                          style={{ backgroundColor: accentColor }}
                        >
                          Continue
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
