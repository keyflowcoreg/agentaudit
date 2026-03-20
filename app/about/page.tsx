'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { EcosystemFooter } from '@/components/EcosystemFooter'

const ECOSYSTEM = [
  { name: 'RulesForge', desc: 'AI coding rules generator', href: 'https://rulesforge.vercel.app' },
  { name: 'AgentAudit', desc: 'AI agent security scanner', href: 'https://agentaudit-five.vercel.app', active: true },
  { name: 'CryptoPayKit', desc: 'x402 crypto payment toolkit', href: 'https://cryptopaykit.vercel.app' },
  { name: 'PromptForge', desc: '200+ AI prompts library', href: 'https://promptforge-indol.vercel.app' },
  { name: 'PageForge', desc: 'AI landing page generator', href: 'https://pageforge-phi.vercel.app' },
  { name: 'OGForge', desc: 'AI social card generator', href: 'https://ogforge.vercel.app' },
  { name: 'ScreenForge', desc: 'App Store screenshot generator', href: 'https://screenforge-ten.vercel.app' },
  { name: 'AIToolsRadar', desc: 'Compare 40+ AI coding tools', href: 'https://aitoolsradar-zeta.vercel.app' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mb-16">
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-8 inline-block">&larr; Back to AgentAudit</Link>
          <h1 className="text-4xl font-bold text-white mb-4">About AgentAudit</h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Part of the AI Business Factory ecosystem — developer tools built to ship faster with AI.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section {...fadeUp} transition={{ delay: 0.2 }} className="mb-16">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Our Mission</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <p className="text-zinc-300 leading-relaxed mb-4">
              AI Business Factory builds developer tools powered by AI. We believe that as AI agents become more powerful, security must evolve alongside them.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              AgentAudit scans your AI agent configurations — CLAUDE.md, .cursorrules, MCP configs — for security vulnerabilities. All scanning runs client-side, so your sensitive configuration data never leaves your browser.
            </p>
          </div>
        </motion.section>

        {/* Ecosystem */}
        <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="mb-16">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">The Ecosystem</h2>
          <p className="text-zinc-400 mb-6">Eight products, one mission: making developers more productive with AI.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ECOSYSTEM.map((product) => (
              <a
                key={product.name}
                href={product.href}
                target={product.active ? undefined : '_blank'}
                rel={product.active ? undefined : 'noopener noreferrer'}
                className={`group rounded-xl border p-4 transition-all ${
                  product.active
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{product.name}</span>
                  {product.active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400">You are here</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{product.desc}</p>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section {...fadeUp} transition={{ delay: 0.4 }} className="mb-16">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Framer Motion', 'Vercel', 'x402 (USDC on Base)'].map((tech) => (
              <span key={tech} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400">
                {tech}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section {...fadeUp} transition={{ delay: 0.5 }}>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <h2 className="text-lg font-bold text-white mb-2">Questions or feedback?</h2>
            <p className="text-sm text-zinc-400 mb-6">We&apos;d love to hear from you.</p>
            <Link
              href="/contact"
              className="inline-block rounded-xl bg-white text-black px-6 py-3 font-semibold text-sm hover:bg-zinc-200 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </motion.section>
      </div>

      <EcosystemFooter currentProduct="AgentAudit" />
    </div>
  )
}
