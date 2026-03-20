# AgentAudit -- AI Agent Security Scanner

## Project Overview
AgentAudit is a security scanner for AI agent configurations (CLAUDE.md, .cursorrules, MCP configs). It analyzes configs client-side for vulnerabilities and provides a risk score with actionable fixes.

## Tech Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- framer-motion for animations
- x402-next + @coinbase/x402 for crypto payments (USDC on Base)
- JetBrains Mono font, dark theme

## Architecture
- `lib/scanner.ts` — Core scanner logic: pattern matching, absence checks, scoring (A-F grades)
- `app/page.tsx` — Landing page with scanner UI, results display, X402 payment gate
- `app/api/full-report/route.ts` — x402-protected endpoint ($47 USDC) for full report
- `app/success/page.tsx` — Payment confirmation page
- `components/x402/` — Shared payment components (X402Checkout, PaymentSuccess)

## Business Logic
- Free tier: risk score (A-F) + top 3 issues with fixes
- Paid tier ($47): all issues + remediation steps + best practices checklist
- All scanning runs client-side — no config data is sent to any server
- Payment via x402 protocol to wallet `0xCc97e4579eeE0281947F15B027f8Cad022933d7e`

## Security Categories Checked
1. Shell Access Permissions (rm -rf, sudo, chmod 777, eval, pipe-to-shell)
2. File System Scope (root access, home dir, sensitive paths)
3. MCP Server Trust (exec servers, filesystem, browser automation)
4. Secret Exposure (API keys, AWS creds, private keys, passwords)
5. Rate Limiting (usage caps, cost guards)
6. Network Access (unrestricted fetch, tunnels)
7. Tool Restrictions (deny rules, safety guardrails)
8. Audit Logging (monitoring, action tracking)

## Key Commands
```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Run ESLint
```
