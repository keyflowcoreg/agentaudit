import { NextRequest, NextResponse } from 'next/server'
import { withX402 } from 'x402-next'

const handler = async (request: NextRequest) => {
  const body = await request.json()
  const { issues = [], grade = 'F', score = 0 } = body

  // Generate remediation steps based on issues
  const remediationSteps = issues.map((issue: { severity: string; title: string; fix: string }, index: number) => ({
    priority: index + 1,
    severity: issue.severity,
    action: issue.title,
    steps: [issue.fix],
  }))

  // Best practices checklist
  const bestPractices = [
    { check: 'Scope file access to project directory only', category: 'Principle of Least Privilege' },
    { check: 'Remove sudo/root access from agent', category: 'Principle of Least Privilege' },
    { check: 'Add explicit deny rules for destructive commands', category: 'Defense in Depth' },
    { check: 'Include safety guardrails in agent instructions', category: 'Defense in Depth' },
    { check: 'Remove hardcoded secrets, use environment variables', category: 'Secret Management' },
    { check: 'Audit all MCP servers for trust level', category: 'MCP Security' },
    { check: 'Restrict network access to required domains only', category: 'Network Security' },
    { check: 'Add rate limits and cost caps', category: 'Cost Control' },
    { check: 'Enable audit logging for all agent actions', category: 'Monitoring' },
    { check: 'Review and update config quarterly', category: 'Maintenance' },
  ]

  return NextResponse.json({
    success: true,
    report: {
      grade,
      score,
      totalIssues: issues.length,
      issues,
      remediationSteps,
      bestPractices,
      generatedAt: new Date().toISOString(),
    },
  })
}

export const POST = withX402(
  handler,
  '0xCc97e4579eeE0281947F15B027f8Cad022933d7e',
  {
    price: '$47',
    network: 'base',
    config: {
      description: 'AgentAudit -- Full Security Report',
    },
  }
)
