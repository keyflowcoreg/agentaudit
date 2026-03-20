'use client'
import { useState } from 'react'

interface StripeCheckoutProps {
  productName: string
  price: number
  currency?: string
  description: string
  successUrl: string
  cancelUrl?: string
  children: React.ReactNode
  accentColor?: string
}

export function StripeCheckout({
  productName,
  price,
  currency = 'usd',
  description,
  successUrl,
  cancelUrl,
  children,
  accentColor = '#10b981'
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, price, description, successUrl, cancelUrl })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout failed:', err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  )
}
