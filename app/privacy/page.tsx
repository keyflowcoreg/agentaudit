import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy -- AgentAudit",
  description:
    "Privacy Policy for AgentAudit. Learn how AI Business Factory collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <PrivacyPolicy
        companyName="AI Business Factory"
        contactEmail="hello@agentaudit.dev"
        websiteUrl="https://agentaudit-five.vercel.app"
        lastUpdated="2026-03-20"
      />
    </main>
  );
}
