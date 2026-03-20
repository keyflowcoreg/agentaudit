'use client'
import { useState, useEffect } from 'react'

const WALLET = '0xCc97e4579eeE0281947F15B027f8Cad022933d7e'

interface PayNowProps {
  productName: string
  price: number
  description: string
  onSuccess?: () => void
  accentColor?: string
  stripeLink?: string
  stripeApiRoute?: string
  /** API route to verify USDC tx hash, e.g. '/api/verify-payment' */
  verifyRoute?: string
}

export function PayNow({
  productName,
  price,
  description,
  onSuccess,
  accentColor = '#10b981',
  stripeLink,
  stripeApiRoute,
  verifyRoute = '/api/verify-payment',
}: PayNowProps) {
  const [method, setMethod] = useState<'card' | 'usdc'>('card')
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState<'idle' | 'pending' | 'verifying' | 'verified' | 'failed' | 'loading'>('idle')
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')

  const hasStripe = !!(stripeLink || stripeApiRoute)

  useEffect(() => {
    if (!hasStripe) setMethod('usdc')
  }, [hasStripe])

  // Check if user returned from Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setStatus('verified')
      onSuccess?.()
    }
  }, [onSuccess])

  const handleStripeCheckout = async () => {
    if (stripeLink) {
      // Stripe Payment Link — user pays there, gets redirected to /success
      // No "I've completed" button needed — Stripe handles the redirect
      setStatus('loading')
      window.location.href = stripeLink
      return
    }

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
          window.location.href = data.url
        }
      } catch {
        setStatus('idle')
        setError('Failed to create checkout. Please try again.')
      }
    }
  }

  const handleVerifyTx = async () => {
    if (!txHash.trim()) {
      setError('Please enter your transaction hash')
      return
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())) {
      setError('Invalid transaction hash format. Must start with 0x followed by 64 hex characters.')
      return
    }

    setStatus('verifying')
    setError('')

    try {
      const res = await fetch(verifyRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: txHash.trim(),
          expectedAmount: price,
          expectedWallet: WALLET,
        }),
      })

      const data = await res.json()

      if (data.verified) {
        setStatus('verified')
        onSuccess?.()
      } else {
        setStatus('failed')
        setError(data.error || 'Payment could not be verified. Please check the transaction hash and try again.')
      }
    } catch {
      setStatus('failed')
      setError('Verification failed. Please try again or contact support.')
    }
  }

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="w-full group">
        <div
          className="relative w-full rounded-xl py-3.5 px-6 font-semibold text-center text-black overflow-hidden transition-all duration-200 group-hover:shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <span className="relative z-10">Buy {productName} — ${price}</span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white" />
        </div>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="relative bg-zinc-900 border border-zinc-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ boxShadow: `0 0 80px -20px ${accentColor}30` }}
          >
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

              {/* Verified state */}
              {status === 'verified' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">Payment Verified!</h4>
                  <p className="text-sm text-zinc-400">Thank you for your purchase. Your access has been activated.</p>
                  <button
                    onClick={() => { setShowModal(false); onSuccess?.() }}
                    className="rounded-xl px-6 py-2.5 text-sm font-semibold text-black"
                    style={{ backgroundColor: accentColor }}
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <>
                  {/* Price */}
                  <div className="text-center mb-6 py-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-zinc-400 ml-1.5 text-sm">USD</span>
                    <p className="text-xs text-zinc-500 mt-1">One-time payment · Verified delivery</p>
                  </div>

                  {/* Payment method toggle */}
                  <div className="flex rounded-xl bg-zinc-800/50 p-1 mb-6">
                    {hasStripe && (
                      <button
                        onClick={() => { setMethod('card'); setError('') }}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          method === 'card' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
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
                      onClick={() => { setMethod('usdc'); setError('') }}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        method === 'usdc' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v12M15 9.5c-.5-1-1.5-1.5-3-1.5s-3 .5-3 2 1.5 2 3 2 3 .5 3 2-1 2-3 2-2.5-.5-3-1.5" />
                        </svg>
                        USDC on Base
                      </span>
                    </button>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Card Payment — redirects to Stripe, no honor-system button */}
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
                            Redirecting to checkout...
                          </span>
                        ) : (
                          `Pay $${price} with Card`
                        )}
                      </button>
                      <p className="text-xs text-zinc-500 text-center">
                        You'll be redirected to Stripe's secure checkout. Visa, Mastercard, Apple Pay, Google Pay.
                      </p>
                    </div>
                  )}

                  {/* USDC Payment — requires tx hash verification */}
                  {method === 'usdc' && (
                    <div className="space-y-4">
                      {status !== 'pending' && status !== 'verifying' ? (
                        <>
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
                            onClick={() => setStatus('pending')}
                            className="w-full rounded-xl border-2 py-3.5 text-sm font-semibold transition-all duration-200 hover:bg-emerald-500/10"
                            style={{ borderColor: '#10b981', color: '#10b981' }}
                          >
                            I've sent the USDC — Verify my payment
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-zinc-400 text-center">
                            Paste your transaction hash to verify payment
                          </p>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={txHash}
                              onChange={(e) => { setTxHash(e.target.value); setError('') }}
                              placeholder="0x..."
                              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                              spellCheck={false}
                            />
                            <p className="text-xs text-zinc-500">
                              Find your tx hash in your wallet app under transaction history, or on{' '}
                              <a href="https://basescan.org" target="_blank" rel="noopener" className="text-cyan-400 hover:underline">basescan.org</a>
                            </p>
                            <button
                              onClick={handleVerifyTx}
                              disabled={status === 'verifying'}
                              className="w-full rounded-xl py-3.5 text-center font-semibold text-black transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                              style={{ backgroundColor: accentColor }}
                            >
                              {status === 'verifying' ? (
                                <span className="flex items-center justify-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Verifying on-chain...
                                </span>
                              ) : (
                                'Verify Payment'
                              )}
                            </button>
                            <button
                              onClick={() => { setStatus('idle'); setTxHash(''); setError('') }}
                              className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
                            >
                              Go back
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Trust signals */}
              {status !== 'verified' && (
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
                    Verified delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    On-chain proof
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
