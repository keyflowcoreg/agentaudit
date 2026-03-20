'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const HUB_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000'

export function Analytics({ product }: { product: string }) {
  const pathname = usePathname()

  useEffect(() => {
    fetch(`${HUB_URL}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, path: pathname })
    }).catch(() => {}) // fire and forget
  }, [pathname, product])

  return null
}
