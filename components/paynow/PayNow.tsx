'use client'
import { useState } from 'react'

const WALLET = '0xCc97e4579eeE0281947F15B027f8Cad022933d7e'

interface PayNowProps {
  productName: string
  price: number // USD
  description: string
  onSuccess?: () => void
  accentColor?: string
}

export function PayNow({ productName, price, description, onSuccess, accentColor = '#10b981' }: PayNowProps) {
  const [method, setMethod] = useState<'card' | 'usdc'>('card')
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle')

  // Coinbase Onramp URL -- opens Coinbase's hosted checkout
  // User buys exactly $X of USDC, which is sent to our wallet
  const coinbaseOnrampUrl = `https://pay.coinbase.com/buy/select-asset?appId=standalone&defaultExperience=buy&destinationWallets=[{"address":"${WALLET}","assets":["USDC"],"supportedNetworks":["base"]}]&defaultAsset=USDC&defaultPaymentMethod=CARD&presetFiatAmount=${price}&fiatCurrency=USD`

  return (
    <>
      <button onClick={() => setShowModal(true)} className="w-full">
        <div className="w-full rounded-lg py-3 px-6 font-semibold text-center text-black"
             style={{ backgroundColor: accentColor }}>
          Buy {productName} — ${price}
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
             onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{productName}</h3>
                <p className="text-sm text-zinc-400">{description}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white text-xl">&times;</button>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-white">${price}</span>
              <span className="text-zinc-400 ml-2">USD</span>
            </div>

            {/* Payment method toggle */}
            <div className="flex rounded-lg border border-zinc-700 overflow-hidden mb-6">
              <button onClick={() => setMethod('card')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  method === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                }`}>
                Card / Apple Pay
              </button>
              <button onClick={() => setMethod('usdc')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  method === 'usdc' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                }`}>
                USDC Direct
              </button>
            </div>

            {method === 'card' ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 text-center">
                  Pay with credit card, debit card, or Apple Pay via Coinbase
                </p>
                <a
                  href={coinbaseOnrampUrl}
                  target="_blank"
                  rel="noopener"
                  className="block w-full rounded-lg py-3 text-center font-semibold text-black"
                  style={{ backgroundColor: accentColor }}
                  onClick={() => setStatus('pending')}
                >
                  Pay ${price} with Card
                </a>
                <p className="text-xs text-zinc-500 text-center">
                  Secure payment via Coinbase. Visa, Mastercard, Apple Pay supported.
                </p>

                {status === 'pending' && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                    <p className="text-sm text-amber-400 font-medium">Payment window opened</p>
                    <p className="text-xs text-zinc-400 mt-1">After completing payment, click below:</p>
                    <button
                      onClick={() => { setStatus('success'); onSuccess?.(); setShowModal(false); }}
                      className="mt-3 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-black"
                    >
                      I've completed the payment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 text-center">
                  Send exactly <span className="text-white font-bold">${price} USDC</span> on Base network
                </p>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Send to this address:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-cyan-400 font-mono break-all">{WALLET}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(WALLET)}
                      className="shrink-0 text-xs text-zinc-400 hover:text-white border border-zinc-600 rounded px-2 py-1"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Base Network</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">USDC</span>
                  </div>
                </div>
                <button
                  onClick={() => { setStatus('success'); onSuccess?.(); setShowModal(false); }}
                  className="w-full rounded-lg border-2 border-emerald-500 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                >
                  I've sent the payment
                </button>
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-center gap-4 text-xs text-zinc-500">
              <span>Secure</span>
              <span>Instant delivery</span>
              <span>No chargebacks</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
