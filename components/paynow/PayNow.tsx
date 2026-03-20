'use client'
import { useState, useEffect } from 'react'

const WALLET = '0xCc97e4579eeE0281947F15B027f8Cad022933d7e'

interface PayNowProps {
  productName: string
  price: number // USD
  description: string
  onSuccess?: () => void
  accentColor?: string
  /** Stripe Payment Link URL — get it from https://dashboard.stripe.com/payment-links */
  stripeLink?: string
  /** Stripe Checkout API route — e.g. '/api/checkout' */
  stripeApiRoute?: string
}

export function PayNow({
  productName,
  price,
  description,
  onSuccess,
  accentColor = '#10b981',
  stripeLink,
  stripeApiRoute,
}: PayNowProps) {
  const [method, setMethod] = useState<'card' | 'usdc'>('card')
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'loading'>('idle')
  const [copied, setCopied] = useState(false)

  const hasStripe = !!(stripeLink || stripeApiRoute)

  // If no Stripe, default to USDC
  useEffect(() => {
    if (!hasStripe) setMethod('usdc')
  }, [hasStripe])

  const handleStripeCheckout = async () => {
    // Option 1: Direct Stripe Payment Link (simplest)
    if (stripeLink) {
      setStatus('pending')
      window.open(stripeLink, '_blank', 'noopener')
      return
    }

    // Option 2: Stripe Checkout Session via API route
    if (stripeApiRoute) {
      setStatus('loading')
      try {
        const res = await fetch(stripeApiRoute, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productName, price }),
        })
        const data = await res.json()
        if (data.url) {
          setStatus('pending')
          window.open(data.url, '_blank', 'noopener')
        }
      } catch {
        setStatus('idle')
      }
    }
  }

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePaymentComplete = () => {
    setStatus('success')
    onSuccess?.()
    setShowModal(false)
  }

  return (
    <>
      {/* CTA Button */}
      <button onClick={() => setShowModal(true)} className="w-full group">
        <div
          className="relative w-full rounded-xl py-3.5 px-6 font-semibold text-center text-black overflow-hidden transition-all duration-200 group-hover:shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <span className="relative z-10">Buy {productName} — ${price}</span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white"
          />
        </div>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="relative bg-zinc-900 border border-zinc-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ boxShadow: `0 0 80px -20px ${accentColor}30` }}
          >
            {/* Accent top bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-white leading-tight">{productName}</h3>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{description}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Price */}
              <div className="text-center mb-6 py-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <span className="text-4xl font-bold text-white">${price}</span>
                <span className="text-zinc-400 ml-1.5 text-sm">USD</span>
                <p className="text-xs text-zinc-500 mt-1">One-time payment · Instant delivery</p>
              </div>

              {/* Payment method toggle */}
              <div className="flex rounded-xl bg-zinc-800/50 p-1 mb-6">
                {hasStripe && (
                  <button
                    onClick={() => setMethod('card')}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      method === 'card'
                        ? 'bg-zinc-700 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Card / Apple Pay
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setMethod('usdc')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    method === 'usdc'
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    USDC on Base
                  </span>
                </button>
              </div>

              {/* Card Payment */}
              {method === 'card' && hasStripe && (
                <div className="space-y-4">
                  <button
                    onClick={handleStripeCheckout}
                    disabled={status === 'loading'}
                    className="w-full rounded-xl py-3.5 text-center font-semibold text-black transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating checkout...
                      </span>
                    ) : (
                      `Pay $${price} with Card`
                    )}
                  </button>
                  <p className="text-xs text-zinc-500 text-center">
                    Secure checkout via Stripe. Visa, Mastercard, Apple Pay, Google Pay.
                  </p>

                  {status === 'pending' && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                        </span>
                        <p className="text-sm text-amber-400 font-medium">Checkout opened in new tab</p>
                      </div>
                      <p className="text-xs text-zinc-400">Complete your payment there, then click below.</p>
                      <button
                        onClick={handlePaymentComplete}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-black transition-colors"
                      >
                        I've completed the payment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* USDC Payment */}
              {method === 'usdc' && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400 text-center">
                    Send exactly <span className="text-white font-bold">${price} USDC</span> on Base network
                  </p>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-3">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Send to</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-cyan-400 font-mono break-all select-all bg-zinc-900/50 rounded-lg p-2.5 border border-zinc-700/50">
                        {WALLET}
                      </code>
                      <button
                        onClick={handleCopyWallet}
                        className="shrink-0 text-xs font-medium border border-zinc-600 hover:border-zinc-500 rounded-lg px-3 py-2.5 transition-colors"
                        style={copied ? { borderColor: accentColor, color: accentColor } : { color: '#a1a1aa' }}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-md font-medium">Base Network</span>
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-md font-medium">USDC</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePaymentComplete}
                    className="w-full rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-200 hover:bg-emerald-500/10"
                    style={{ borderColor: '#10b981', color: '#10b981' }}
                  >
                    I've sent the payment
                  </button>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-center gap-6 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Instant delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
