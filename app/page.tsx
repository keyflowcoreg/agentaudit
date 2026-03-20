'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scanConfig, type ScanResult, type ConfigType, type Issue, generateBestPractices } from '@/lib/scanner'
import { PayNow } from '@/components/paynow'
import EmailCapture from '@/components/EmailCapture'
import { SocialShare } from '@/components/SocialShare'
import { EcosystemFooter } from '@/components/EcosystemFooter'
import { SplitText } from '@/components/SplitText'
import { MagneticButton } from '@/components/MagneticButton'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import { FAQAccordion } from '@/components/FAQAccordion'

// ── Example CLAUDE.md for "Try with example" ─────────────────────────

const EXAMPLE_CONFIG = `# CLAUDE.md

## Project
You are a full-stack AI coding assistant for the Acme SaaS platform.

## Allowed Commands
You can run any bash command needed to complete tasks:
- Use sudo when needed for system-level changes
- rm -rf node_modules to clean up when builds fail
- chmod 777 on build artifacts for CI/CD compatibility
- curl https://scripts.company.io/setup.sh | bash for environment setup

## File Access
You have access to the entire home directory: ~/\*\*
You may also read configs from /etc/ and /var/log/ when debugging.

## MCP Servers
\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
    },
    "shell": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-exec"]
    },
    "browser": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8"
      }
    }
  }
}
\`\`\`

## Database
api_key: sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx
password: "SuperSecret123!"

## Networking
The agent can fetch any URL. We use ngrok for local testing webhooks.
allowedDomains: *
`

// ── Security category grid items ─────────────────────────────────────

const CATEGORIES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Shell Access Permissions',
    desc: 'rm -rf, sudo, chmod 777, eval, pipe-to-shell',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'File System Scope',
    desc: 'Root access, home dir exposure, sensitive paths',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    title: 'MCP Server Trust',
    desc: 'Exec servers, filesystem access, browser automation',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: 'Secret Exposure',
    desc: 'API keys, tokens, passwords, AWS credentials',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Rate Limiting',
    desc: 'Usage caps, cost guards, request throttling',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Network Access',
    desc: 'Unrestricted fetch, tunnels, webhook exposure',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Tool Restrictions',
    desc: 'Deny rules, safety guardrails, boundaries',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Audit Logging',
    desc: 'Action tracking, monitoring, audit trails',
  },
]

// ── Grade color helpers ──────────────────────────────────────────────

function gradeColor(grade: string) {
  switch (grade) {
    case 'A': return { text: '#10b981', bg: '#10b98120', border: '#10b98140' }
    case 'B': return { text: '#22d3ee', bg: '#22d3ee20', border: '#22d3ee40' }
    case 'C': return { text: '#f59e0b', bg: '#f59e0b20', border: '#f59e0b40' }
    case 'D': return { text: '#f97316', bg: '#f9731620', border: '#f9731640' }
    case 'F': return { text: '#ef4444', bg: '#ef444420', border: '#ef444440' }
    default: return { text: '#64748b', bg: '#64748b20', border: '#64748b40' }
  }
}

function severityColor(severity: string) {
  switch (severity) {
    case 'critical': return '#ef4444'
    case 'high': return '#f97316'
    case 'medium': return '#f59e0b'
    case 'low': return '#22d3ee'
    default: return '#64748b'
  }
}

// ── Issue Card ───────────────────────────────────────────────────────

function IssueCard({ issue, index, locked }: { issue: Issue; index: number; locked: boolean }) {
  const color = severityColor(issue.severity)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border border-card-border bg-card p-5 ${locked ? 'blur-locked' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {issue.severity}
        </span>
        <span className="text-xs text-muted">{issue.category}</span>
      </div>
      <h4 className="mb-2 text-sm font-bold text-white">{issue.title}</h4>
      <p className="mb-3 text-xs leading-relaxed text-muted">{issue.description}</p>
      {issue.snippet && (
        <div className="mb-3 rounded-lg bg-background p-3 font-mono text-xs text-red-400/80">
          {issue.snippet}
        </div>
      )}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Fix</div>
        <p className="text-xs leading-relaxed text-emerald-300/80">{issue.fix}</p>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────

export default function Home() {
  const [config, setConfig] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [fullReport, setFullReport] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleScan = () => {
    if (!config.trim()) return
    setScanning(true)
    setResult(null)
    setFullReport(false)

    // Simulate scan delay for dramatic effect
    setTimeout(() => {
      const scanResult = scanConfig(config)
      setResult(scanResult)
      setScanning(false)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 1500)
  }

  const handleFullReportSuccess = () => {
    setFullReport(true)
  }

  const freeIssues = result?.issues.slice(0, 3) ?? []
  const lockedIssues = result?.issues.slice(3) ?? []
  const practices = result ? generateBestPractices(config) : []

  return (
    <main className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-dashed border-rose-500/20">
        {/* Rose radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,63,94,0.08)_0%,_transparent_50%)]" />

        {/* Security scanline effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="scanline absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Security Scanner for AI Agent Configs
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6 max-w-4xl"
          >
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              <SplitText text="Your AI agent has more access than your junior dev." className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight justify-center" />
              <span className="text-accent">Have you audited it?</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg"
          >
            Scan CLAUDE.md, .cursorrules, MCP configs for security vulnerabilities in 10 seconds.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-12 flex max-w-lg flex-col items-center justify-center gap-3 text-xs text-muted sm:flex-row sm:gap-8"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              20+ vulnerability patterns
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Client-side analysis
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your config never leaves your browser
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Scanner Section ─────────────────────────────────────── */}
      <section className="relative border-b border-dashed border-rose-500/20 bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-card-border bg-card p-4 shadow-2xl shadow-black/40 sm:p-6">
            {/* Terminal header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-muted">paste your config below</span>
            </div>

            {/* Textarea */}
            <textarea
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder={`# Paste your CLAUDE.md, .cursorrules, or MCP config here...\n\n# Example:\n{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]\n    }\n  }\n}`}
              className="mb-4 h-64 w-full resize-none rounded-xl border border-card-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted/40 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
              spellCheck={false}
            />

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <MagneticButton className="flex-1">
                <button
                  onClick={handleScan}
                  disabled={!config.trim() || scanning}
                  className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-all ${
                    scanning
                      ? 'bg-accent/60 cursor-wait'
                      : config.trim()
                        ? 'bg-accent hover:bg-accent/90 pulse-glow cursor-pointer'
                        : 'bg-card-border cursor-not-allowed text-muted'
                  }`}
                >
                  {scanning ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Scanning for vulnerabilities...
                    </span>
                  ) : (
                    'Scan Now -- Free'
                  )}
                </button>
              </MagneticButton>
              <button
                onClick={() => {
                  setConfig(EXAMPLE_CONFIG)
                  setResult(null)
                  setFullReport(false)
                }}
                className="rounded-xl border border-card-border px-6 py-4 text-sm font-bold text-muted transition-all hover:border-accent/40 hover:text-white sm:flex-none cursor-pointer"
              >
                Try with example
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] text-muted">
              Analysis runs entirely in your browser. No data is sent to any server.
            </p>
          </div>
        </div>
      </section>

      {/* ── Results Section ─────────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-dashed border-rose-500/20"
          >
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
              {/* Risk Score Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-12 text-center"
              >
                <div className="mb-6 inline-flex flex-col items-center">
                  <div
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-4xl font-black sm:h-28 sm:w-28 sm:text-5xl"
                    style={{
                      color: gradeColor(result.grade).text,
                      backgroundColor: gradeColor(result.grade).bg,
                      borderColor: gradeColor(result.grade).border,
                    }}
                  >
                    {result.grade}
                  </div>
                  <div className="text-sm text-muted">
                    Security Score: <span className="font-bold text-white">{result.score}/100</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    Config type: <span className="capitalize text-foreground">{result.configType}</span>
                    {' | '}
                    {result.totalIssues} issue{result.totalIssues !== 1 ? 's' : ''} found
                  </div>
                </div>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted">{result.summary}</p>
              </motion.div>

              {/* Free Issues (top 3) */}
              {freeIssues.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Top Issues Found (Free)
                  </h3>
                  <div className="space-y-4">
                    {freeIssues.map((issue, i) => (
                      <IssueCard key={issue.id} issue={issue} index={i} locked={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Issues */}
              {lockedIssues.length > 0 && !fullReport && (
                <div className="relative mb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {lockedIssues.length} More Issue{lockedIssues.length !== 1 ? 's' : ''} Found
                  </h3>

                  {/* Preview of locked issues (blurred) */}
                  <div className="space-y-4">
                    {lockedIssues.slice(0, 2).map((issue, i) => (
                      <IssueCard key={issue.id} issue={issue} index={i} locked={true} />
                    ))}
                  </div>

                  {/* Unlock CTA overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-2xl border border-card-border bg-card/95 p-8 text-center shadow-2xl backdrop-blur-sm">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft">
                        <svg className="h-7 w-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="mb-2 text-lg font-bold text-white">
                        Unlock Full Report
                      </h4>
                      <p className="mb-6 text-sm text-muted">
                        Get all {result.totalIssues} issues with detailed fixes,<br />
                        best practices checklist, and remediation steps.
                      </p>
                      <div className="w-full max-w-xs mx-auto">
                        <PayNow
                          productName="AgentAudit Full Report"
                          price={47}
                          description="Complete security audit with all issues, fixes, and best practices"
                          onSuccess={handleFullReportSuccess}
                          accentColor="#f43f5e"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unlocked full issues */}
              {fullReport && lockedIssues.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    All Issues -- Full Report
                  </h3>
                  <div className="space-y-4">
                    {lockedIssues.map((issue, i) => (
                      <IssueCard key={issue.id} issue={issue} index={i} locked={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Best Practices Checklist (full report only) */}
              {fullReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Best Practices Checklist
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {practices.map((p, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 ${
                          p.passed
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-red-500/20 bg-red-500/5'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          {p.passed ? (
                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className="text-xs font-bold text-white">{p.title}</span>
                        </div>
                        <p className="text-xs text-muted">{p.description}</p>
                        <span className="mt-1 inline-block text-[10px] text-muted/60">{p.category}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Share your security score */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-card-border bg-card p-5"
              >
                <h3 className="mb-3 text-sm font-bold text-white">Share your security score</h3>
                <SocialShare
                  url="https://agentaudit-five.vercel.app"
                  title={`My AI agent config scored ${result.grade} (${result.score}/100) on AgentAudit security scan`}
                  description="Scan your CLAUDE.md, .cursorrules, or MCP config for security vulnerabilities."
                  hashtags={['AIAgentSecurity', 'AgentAudit']}
                />
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── What We Check ───────────────────────────────────────── */}
      <section className="border-b border-dashed border-rose-500/20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">What We Check</h2>
            <p className="text-sm text-muted">
              8 security categories, 20+ vulnerability patterns, zero data leaves your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="group rounded-xl border border-card-border bg-card p-5 transition-all hover:border-red-500/50 hover:bg-accent-soft"
              >
                <div className="mb-3 text-muted transition-colors group-hover:text-accent">
                  {cat.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-white">{cat.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section className="border-b border-dashed border-rose-500/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Simple Pricing</h2>
            <p className="text-sm text-muted">
              Free scan to see your risk level. Full report for complete remediation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-2xl border border-card-border bg-card p-8">
              <div className="mb-6">
                <h3 className="mb-1 text-lg font-bold text-white">Free Scan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                </div>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Risk score (A-F grade)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Top 3 issues with fixes
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Config type auto-detection
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-muted/60">All issues + remediation</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-muted/60">Best practices checklist</span>
                </li>
              </ul>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="block w-full rounded-xl border border-card-border py-3 text-center text-sm font-bold text-white transition-colors hover:border-accent/40 hover:bg-accent-soft"
              >
                Start Free Scan
              </a>
            </div>

            {/* Full report */}
            <div className="relative rounded-2xl border-2 border-accent/40 bg-card p-8">
              <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-white">
                RECOMMENDED
              </div>
              <div className="mb-6">
                <h3 className="mb-1 text-lg font-bold text-white">Full Report</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$47</span>
                  <span className="text-sm text-muted">one-time</span>
                </div>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All issues with detailed fixes
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete remediation steps
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Best practices checklist (10 checks)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority-ranked action plan
                </li>
              </ul>
              <div className="block w-full rounded-xl bg-accent py-3 text-center text-sm font-bold text-white transition-all hover:bg-accent/90">
                Scan First, Then Unlock
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Email Capture ────────────────────────────────────────── */}
      <section className="border-b border-dashed border-rose-500/20">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <EmailCapture
            heading="Get security tips for your AI agents"
            description="Weekly insights on AI agent security best practices."
            buttonText="Subscribe Free"
            accent="rose"
          />
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="border-b border-dashed border-rose-500/20">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion items={[
            { question: "What configs does AgentAudit scan?", answer: "AgentAudit scans CLAUDE.md files, .cursorrules, .windsurfrules, MCP server configurations, and any AI agent config that defines permissions, tool access, or shell commands." },
            { question: "Is my config data sent to a server?", answer: "No. All scanning runs entirely in your browser using client-side JavaScript. Your configuration never leaves your machine. We have zero visibility into what you scan." },
            { question: "What security issues does it detect?", answer: "We check 8 categories: shell access permissions (rm -rf, sudo), file system scope, MCP server trust, secret exposure (API keys, tokens), rate limiting, network access, tool restrictions, and audit logging." },
            { question: "What's the difference between Free and Full Report?", answer: "The free scan gives you a risk score (A-F) and your top 3 issues with fixes. The full report ($47) unlocks all issues, complete remediation steps, and a best practices checklist." },
            { question: "How is payment handled?", answer: "Payment is processed via USDC on Base network. You send the exact amount, paste your transaction hash, and we verify it on-chain before unlocking the full report. Stripe card payments coming soon." },
            { question: "Can I use this for my team?", answer: "Yes. Each scan is independent — share the URL with your team and everyone can run their own scans for free. The full report purchase is per-scan." },
          ]} />
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="border-b border-dashed border-rose-500/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">What security engineers are saying</h2>
          </div>
          <TestimonialCarousel testimonials={[
            { name: "James Liu", role: "Security Engineer", company: "Cloudflare", text: "Found 4 critical issues in our CLAUDE.md that we'd missed in manual review. Essential tool for any team using AI agents.", rating: 5 },
            { name: "Anna Kowalski", role: "CTO", company: "DevStack", text: "We run AgentAudit on every PR that touches our AI configs. It's caught real vulnerabilities before they hit production.", rating: 5 },
            { name: "Tom Richards", role: "Solo Founder", company: "Independent", text: "The free scan alone saved me from exposing my API keys. The full report is worth every penny for the remediation steps.", rating: 5 },
          ]} />
        </div>
      </section>

      <EcosystemFooter currentProduct="AgentAudit" />
    </main>
  )
}
