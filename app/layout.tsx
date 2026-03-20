import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import { Analytics } from "@/components/Analytics"
import { CookieBanner } from "@/components/CookieBanner"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { NoiseOverlay } from "@/components/NoiseOverlay"
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
    title: "AgentAudit — AI Agent Security Scanner",
    description:
      "Scan CLAUDE.md, .cursorrules, MCP configs for security vulnerabilities",
    type: "website",
    siteName: "AgentAudit",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentAudit — AI Agent Security Scanner",
    description:
      "Scan CLAUDE.md, .cursorrules, MCP configs for security vulnerabilities",
    images: ["/api/og"],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AgentAudit",
          "description": "AI agent security scanner",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "47",
            "priceCurrency": "USD"
          }
        }) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-mono">
        <NoiseOverlay />
        <AnnouncementBar items={['LAUNCH WEEK \u2014 Limited time pricing', 'Scan your AI agent config free \u2014 Full report $47']} />
        <Analytics product="agentaudit" />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
