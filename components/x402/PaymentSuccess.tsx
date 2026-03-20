'use client'

import { useEffect, useState } from 'react'

interface PaymentSuccessProps {
  /** Product name displayed in the success message */
  productName: string
  /** On-chain transaction ID to show as receipt */
  transactionId?: string
  /** Download URL for digital product delivery */
  downloadUrl?: string
  /** URL to return to the product page */
  returnUrl?: string
  /** Label for the return link */
  returnLabel?: string
  /** Custom accent color in hex, defaults to #10b981 (emerald) */
  accentColor?: string
  /** Additional content below the success card */
  children?: React.ReactNode
}

export function PaymentSuccess({
  productName,
  transactionId,
  downloadUrl,
  returnUrl = '/',
  returnLabel = 'Return to product',
  accentColor = '#10b981',
  children,
}: PaymentSuccessProps) {
  const [showCheck, setShowCheck] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 300)
    const t2 = setTimeout(() => setShowContent(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4 py-20">
      <div className="w-full max-w-md text-center">
        {/* Animated checkmark circle */}
        <div className="relative mx-auto mb-8 h-24 w-24">
          {/* Outer ring animation */}
          <svg className="absolute inset-0 h-24 w-24" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke={`${accentColor}20`}
              strokeWidth="4"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke={accentColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="276.46"
              strokeDashoffset={showCheck ? '0' : '276.46'}
              style={{
                transition: 'stroke-dashoffset 0.8s ease-out',
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              }}
            />
          </svg>
          {/* Inner check */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: showCheck ? 1 : 0,
              transform: showCheck ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.4s ease-out 0.4s',
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <svg className="h-8 w-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.5s ease-out',
          }}
        >
          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            Payment Confirmed!
          </h1>
          <p className="mb-6 text-[#94a3b8]">
            You now have full access to <span className="font-semibold text-white">{productName}</span>.
          </p>

          {/* Transaction Receipt */}
          {transactionId && (
            <div className="mb-6 rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 text-left">
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#64748b]">
                Transaction
              </div>
              <p className="break-all font-mono text-xs text-[#94a3b8]">
                {transactionId}
              </p>
            </div>
          )}

          {/* Download Button */}
          {downloadUrl && (
            <a
              href={downloadUrl}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: accentColor }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download {productName}
            </a>
          )}

          {/* Additional content slot */}
          {children && (
            <div className="mb-6">
              {children}
            </div>
          )}

          {/* Return link */}
          <a
            href={returnUrl}
            className="inline-flex items-center gap-1 text-sm transition-colors hover:text-white"
            style={{ color: `${accentColor}cc` }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {returnLabel}
          </a>

          {/* x402 badge */}
          <p className="mt-8 text-[10px] text-[#334155]">
            Payment processed via x402 protocol on-chain
          </p>
        </div>
      </div>
    </div>
  )
}
