import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@/components/Analytics"
import { CookieBanner } from "@/components/CookieBanner"
import "./globals.css"

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "AgentAudit -- AI Agent Security Scanner",
  description:
    "Paste your CLAUDE.md, .cursorrules, or MCP config. Get a security risk score + actionable fixes. Free scan, $47 full report.",
  keywords: [
    "AI agent security",
    "CLAUDE.md scanner",
    "cursorrules audit",
    "MCP config security",
    "AI coding agent security",
    "agent configuration audit",
  ],
  openGraph: {
    title: "AgentAudit -- AI Agent Security Scanner",
    description:
      "Your AI agent has more access than your junior dev. Have you audited it?",
    type: "website",
    siteName: "AgentAudit",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentAudit -- AI Agent Security Scanner",
    description:
      "Scan CLAUDE.md, .cursorrules, MCP configs for security vulnerabilities in 10 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrains.variable} h-full antialiased dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AgentAudit",
              description:
                "AI agent security scanner. Paste your CLAUDE.md, .cursorrules, or MCP config. Get a security risk score and actionable fixes.",
              url: "https://agentaudit.dev",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "47",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-mono">
        <Analytics product="agentaudit" />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
