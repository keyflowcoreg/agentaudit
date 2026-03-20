import { NextRequest, NextResponse } from 'next/server'

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET) {
    return NextResponse.json({
      fallback: true,
      message: 'Stripe not configured. Pay with USDC instead.',
      wallet: '0xCc97e4579eeE0281947F15B027f8Cad022933d7e',
      network: 'Base'
    })
  }

  const { productName, price, description, successUrl, cancelUrl } = await req.json()

  const stripe = require('stripe')(STRIPE_SECRET)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: productName,
          description: description,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    }],
    success_url: successUrl || `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || req.nextUrl.origin,
  })

  return NextResponse.json({ url: session.url })
}
