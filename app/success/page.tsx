'use client'

import { PaymentSuccess } from '@/components/x402'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const txId = searchParams.get('tx') || undefined

  return (
    <PaymentSuccess
      productName="AgentAudit Full Report"
      transactionId={txId}
      returnUrl="/"
      returnLabel="Scan another config"
      accentColor="#f43f5e"
    >
      <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 text-left">
        <h3 className="mb-2 text-sm font-bold text-white">Your full report includes:</h3>
        <ul className="space-y-1.5 text-xs text-[#94a3b8]">
          <li className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            All security issues with severity ranking
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Detailed remediation steps for each issue
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Best practices checklist (10 security checks)
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Priority-ranked action plan
          </li>
        </ul>
      </div>
    </PaymentSuccess>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
