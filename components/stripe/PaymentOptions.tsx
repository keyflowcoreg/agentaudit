'use client'
import { useState } from 'react'
import { StripeCheckout } from './StripeCheckout'
import { X402Checkout } from '@/components/x402/X402Checkout'

interface PaymentOptionsProps {
  productName: string
  price: number
  description: string
  x402Endpoint: string
  x402Method?: 'GET' | 'POST'
  x402Body?: any
  successUrl: string
  onX402Success?: (data: any) => void
  accentColor?: string
}

export function PaymentOptions({
  productName, price, description,
  x402Endpoint, x402Method = 'GET', x402Body,
  successUrl, onX402Success, accentColor = '#10b981'
}: PaymentOptionsProps) {
  const [method, setMethod] = useState<'card' | 'crypto'>('card')

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
        <button
          onClick={() => setMethod('card')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            method === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Credit Card
        </button>
        <button
          onClick={() => setMethod('crypto')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            method === 'crypto' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          USDC (Base)
        </button>
      </div>

      {/* Card method */}
      {method === 'card' && (
        <StripeCheckout
          productName={productName}
          price={price}
          description={description}
          successUrl={successUrl}
          accentColor={accentColor}
        >
          <div className="w-full rounded-lg py-3 font-semibold text-center text-black" style={{ backgroundColor: accentColor }}>
            Pay ${price} with Card
          </div>
        </StripeCheckout>
      )}

      {/* Crypto method */}
      {method === 'crypto' && (
        <X402Checkout
          endpoint={x402Endpoint}
          method={x402Method}
          body={x402Body}
          productName={productName}
          price={`$${price}`}
          description={description}
          onSuccess={onX402Success || (() => { window.location.href = successUrl })}
          accentColor={accentColor}
        >
          <div className="w-full rounded-lg py-3 font-semibold text-center border-2 text-white" style={{ borderColor: accentColor }}>
            Pay ${price} USDC
          </div>
        </X402Checkout>
      )}

      <p className="text-xs text-zinc-500 text-center">
        {method === 'card' ? 'Secure payment via Stripe. Visa, Mastercard, Apple Pay, Google Pay.' : 'Direct USDC payment on Base network. No intermediaries.'}
      </p>
    </div>
  )
}
