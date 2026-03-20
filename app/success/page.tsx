'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { EcosystemFooter } from '@/components/EcosystemFooter'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-bold text-white mb-4">Payment Verified!</h1>
          <p className="text-lg text-zinc-400 mb-2">Thank you for purchasing AgentAudit Full Report.</p>
          <p className="text-sm text-zinc-500 mb-8">Your access has been activated. Check your email for confirmation.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-4">
          {/* What you get */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">What&apos;s included</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Full security report with all issues and severity rankings
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Detailed remediation steps for every vulnerability
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                10-point security best practices checklist
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Priority-ranked action plan for your team
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Covers shell access, MCP trust, secrets, network, and more
              </li>
            </ul>
          </div>

          {/* Next steps */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Next steps</h3>
            <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
              <li>Review the full report in your dashboard</li>
              <li>Address critical and high-severity issues first</li>
              <li>Apply the recommended fixes to your agent configs</li>
              <li>Re-scan to verify your security improvements</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Link href="/" className="rounded-xl bg-white text-black px-6 py-3 font-semibold text-sm hover:bg-zinc-200 transition-colors">
              Back to AgentAudit
            </Link>
            <Link href="/contact" className="rounded-xl border border-zinc-700 text-zinc-300 px-6 py-3 font-semibold text-sm hover:border-zinc-500 transition-colors">
              Need help?
            </Link>
          </div>
        </motion.div>

        {/* Social share */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12">
          <p className="text-sm text-zinc-500 mb-3">Share your purchase</p>
          <div className="flex justify-center gap-3">
            <a href="https://twitter.com/intent/tweet?text=Just%20secured%20my%20AI%20agents%20with%20AgentAudit!%20Full%20security%20scan%20for%20CLAUDE.md%20and%20MCP%20configs.&url=https://agentaudit-five.vercel.app" target="_blank" rel="noopener" className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">Share on X</a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://agentaudit-five.vercel.app" target="_blank" rel="noopener" className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">Share on LinkedIn</a>
          </div>
        </motion.div>
      </div>

      <EcosystemFooter currentProduct="AgentAudit" />
    </div>
  )
}
