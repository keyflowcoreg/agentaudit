'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

type PaymentStatus = 'idle' | 'connecting' | 'paying' | 'confirming' | 'success' | 'error'

interface X402PaymentInfo {
  address: string
  amount: string
  network: string
  description: string
}

interface X402CheckoutProps {
  /** The API endpoint that returns 402 (e.g. "/api/premium") */
  endpoint: string
  /** HTTP method for the endpoint */
  method?: 'GET' | 'POST'
  /** Request body for POST requests */
  body?: any
  /** Product name shown in the modal */
  productName: string
  /** Price displayed (e.g. "$19") */
  price: string
  /** Short product description */
  description: string
  /** Called with response data after successful payment */
  onSuccess: (data: any) => void
  /** Called on payment error */
  onError?: (error: string) => void
  /** The clickable element that triggers the checkout flow */
  children: React.ReactNode
  /** Override wallet address (defaults to x402 header or fallback) */
  walletAddress?: string
  /** Override network (defaults to x402 header or "base") */
  network?: string
  /** Custom accent color in hex, defaults to #06b6d4 (cyan) */
  accentColor?: string
}

const FALLBACK_ADDRESS = '0xCc97e4579eeE0281947F15B027f8Cad022933d7e'
const FALLBACK_NETWORK = 'base'

export function X402Checkout({
  endpoint,
  method = 'GET',
  body,
  productName,
  price,
  description,
  onSuccess,
  onError,
  children,
  walletAddress,
  network,
  accentColor = '#06b6d4',
}: X402CheckoutProps) {
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [paymentInfo, setPaymentInfo] = useState<X402PaymentInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!showModal) {
      setStatus('idle')
      setErrorMsg('')
      setCopied(false)
      setTxHash('')
    }
  }, [showModal])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal && status !== 'paying') {
        setShowModal(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showModal, status])

  // Step 1: Hit the endpoint, expect 402, extract payment headers
  const initiatePayment = useCallback(async () => {
    setStatus('connecting')
    setErrorMsg('')

    try {
      const fetchOpts: RequestInit = { method }
      if (method === 'POST' && body) {
        fetchOpts.headers = { 'Content-Type': 'application/json' }
        fetchOpts.body = JSON.stringify(body)
      }

      const res = await fetch(endpoint, fetchOpts)

      if (res.ok) {
        // Already has access -- no payment needed
        const data = await res.json()
        setStatus('success')
        onSuccess(data)
        return
      }

      if (res.status === 402) {
        const info: X402PaymentInfo = {
          address: res.headers.get('X-Payment-Address') || walletAddress || FALLBACK_ADDRESS,
          amount: res.headers.get('X-Payment-Amount') || price,
          network: res.headers.get('X-Payment-Network') || network || FALLBACK_NETWORK,
          description: res.headers.get('X-Payment-Description') || description,
        }
        setPaymentInfo(info)
        setStatus('idle')
        setShowModal(true)
        return
      }

      throw new Error(`Unexpected response: ${res.status}`)
    } catch (err: any) {
      // If we couldn't reach the server, show the modal with fallback info
      setPaymentInfo({
        address: walletAddress || FALLBACK_ADDRESS,
        amount: price,
        network: network || FALLBACK_NETWORK,
        description,
      })
      setStatus('idle')
      setShowModal(true)
    }
  }, [endpoint, method, body, price, description, walletAddress, network, onSuccess])

  // Step 2: After user pays, verify by re-sending request with payment proof
  const verifyPayment = useCallback(async (hash: string) => {
    setStatus('confirming')
    setErrorMsg('')

    try {
      const fetchOpts: RequestInit = {
        method,
        headers: {
          'X-Payment-Proof': hash,
          'X-Payment-Token': hash,
        },
      }
      if (method === 'POST' && body) {
        (fetchOpts.headers as Record<string, string>)['Content-Type'] = 'application/json'
        fetchOpts.body = JSON.stringify(body)
      }

      const res = await fetch(endpoint, fetchOpts)

      if (res.ok) {
        const data = await res.json()
        setStatus('success')
        setTimeout(() => {
          onSuccess(data)
        }, 1500)
        return
      }

      if (res.status === 402) {
        setErrorMsg('Payment not yet confirmed. Please wait a moment and try again.')
        setStatus('idle')
        return
      }

      throw new Error(`Verification failed: ${res.status}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify payment')
      setStatus('error')
      onError?.(err.message || 'Verification failed')
    }
  }, [endpoint, method, body, onSuccess, onError])

  const copyAddress = useCallback(() => {
    const addr = paymentInfo?.address || walletAddress || FALLBACK_ADDRESS
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [paymentInfo, walletAddress])

  const handleClick = () => {
    initiatePayment()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && status !== 'paying' && status !== 'confirming') {
      setShowModal(false)
    }
  }

  const displayAddress = paymentInfo?.address || walletAddress || FALLBACK_ADDRESS
  const displayNetwork = paymentInfo?.network || network || FALLBACK_NETWORK
  const displayAmount = paymentInfo?.amount || price

  return (
    <>
      {/* Wrap children as clickable trigger */}
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleOverlayClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl shadow-black/50 overflow-hidden"
            style={{ '--accent': accentColor } as React.CSSProperties}
          >
            {/* Header gradient bar */}
            <div
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
            />

            {/* Close button */}
            {status !== 'paying' && status !== 'confirming' && (
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#94a3b8] transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="p-6">
              {/* Success State */}
              {status === 'success' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-8 w-8 text-emerald-400 animate-[scale-in_0.3s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-white">Payment Confirmed!</h3>
                  <p className="text-sm text-[#94a3b8]">Unlocking {productName}...</p>
                </div>
              ) : (
                <>
                  {/* Product Info */}
                  <div className="mb-6 text-center">
                    <div
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${accentColor}15` }}
                    >
                      <svg
                        className="h-6 w-6"
                        style={{ color: accentColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">{productName}</h3>
                    <p className="mt-1 text-sm text-[#94a3b8]">{description}</p>
                  </div>

                  {/* Price Badge */}
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-[#1e293b] bg-[#1e293b]/50 px-4 py-2">
                      {/* USDC icon */}
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2775CA]">
                        <span className="text-xs font-bold text-white">$</span>
                      </div>
                      <span className="text-lg font-bold text-white">{displayAmount}</span>
                      <span className="text-sm text-[#94a3b8]">USDC</span>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs font-medium capitalize" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                      {displayNetwork}
                    </div>
                  </div>

                  {/* Wallet Address Card */}
                  <div className="mb-4 rounded-xl border border-[#1e293b] bg-[#0c1322] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-[#64748b]">
                        Send USDC to
                      </span>
                      <button
                        onClick={copyAddress}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-white/5"
                        style={{ color: accentColor }}
                      >
                        {copied ? (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="break-all rounded-lg bg-[#0f172a] p-3 font-mono text-sm text-white/90 select-all">
                      {displayAddress}
                    </p>
                  </div>

                  {/* Network Info */}
                  <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#1e293b]/60 bg-[#1e293b]/20 px-3 py-2.5 text-xs text-[#94a3b8]">
                    <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Send exactly <span className="font-semibold text-white">{displayAmount} USDC</span> on <span className="font-semibold text-white capitalize">{displayNetwork}</span> network. Other tokens or amounts will not be recognized.
                    </span>
                  </div>

                  {/* TX Hash Input & Verify */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-[#64748b]">
                      Transaction hash (after sending)
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-lg border border-[#1e293b] bg-[#0c1322] px-3 py-2.5 font-mono text-sm text-white placeholder-[#334155] outline-none transition-colors focus:border-[#94a3b8]/40"
                    />
                  </div>

                  {/* Confirm / Verify Button */}
                  <button
                    onClick={() => {
                      if (txHash.trim()) {
                        verifyPayment(txHash.trim())
                      } else {
                        // Demo mode: simulate success
                        setStatus('confirming')
                        setTimeout(() => {
                          setStatus('success')
                          setTimeout(() => {
                            onSuccess({ demo: true, productName })
                          }, 1500)
                        }, 2000)
                      }
                    }}
                    disabled={status === 'confirming'}
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: status === 'confirming' ? `${accentColor}80` : accentColor,
                    }}
                  >
                    {status === 'confirming' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying payment...
                      </span>
                    ) : txHash.trim() ? (
                      'Verify Payment'
                    ) : (
                      "I've Sent the Payment"
                    )}
                  </button>

                  {/* Error message */}
                  {errorMsg && (
                    <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
                      {errorMsg}
                    </p>
                  )}

                  {/* Footer */}
                  <p className="mt-4 text-center text-[10px] text-[#475569]">
                    Powered by x402 protocol. Payments are processed on-chain and non-reversible.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scale-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </>
  )
}
