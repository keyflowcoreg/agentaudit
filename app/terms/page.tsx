import type { Metadata } from "next";
import { TermsOfService } from "@/components/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service -- AgentAudit",
  description:
    "Terms of Service for AgentAudit. Read the terms governing your use of the AgentAudit security scanner.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <TermsOfService
        companyName="AI Business Factory"
        productName="AgentAudit"
        contactEmail="hello@agentaudit.dev"
        websiteUrl="https://agentaudit-five.vercel.app"
        lastUpdated="2026-03-20"
      />
    </main>
  );
}
