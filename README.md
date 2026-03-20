# AgentAudit

Security scanner for AI agent configurations.

[![Live Demo](https://img.shields.io/badge/Live_Demo-agentaudit.vercel.app-blue?style=for-the-badge)](https://agentaudit-five.vercel.app)

[Live Demo](https://agentaudit-five.vercel.app) | [Report Bug](https://github.com/keyflowcoreg/agentaudit/issues)

## Features

- Scan CLAUDE.md, .cursorrules, and MCP configs for security vulnerabilities
- Client-side analysis -- no config data leaves your browser
- Risk scoring from A to F with actionable fix recommendations
- Checks 8 security categories: shell access, file scope, MCP trust, secrets, rate limits, network, tool restrictions, audit logging
- Full detailed report available via x402 payment

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · x402 Payments

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

## License

MIT
