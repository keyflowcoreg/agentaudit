export type ConfigType = 'claude' | 'cursor' | 'mcp' | 'auto'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface Issue {
  id: string
  category: string
  title: string
  description: string
  severity: Severity
  line?: number
  snippet?: string
  fix: string
}

export interface ScanResult {
  grade: RiskGrade
  score: number // 0-100, lower is worse
  configType: ConfigType
  totalIssues: number
  issues: Issue[]
  summary: string
}

// ── Pattern definitions ──────────────────────────────────────────────

interface Pattern {
  id: string
  category: string
  title: string
  description: string
  severity: Severity
  regex: RegExp
  fix: string
}

const DANGEROUS_COMMANDS: Pattern[] = [
  {
    id: 'shell-rm-rf',
    category: 'Shell Access',
    title: 'Destructive shell command allowed',
    description: 'Config permits `rm -rf` which can recursively delete entire file trees. An agent with this access could wipe critical data.',
    severity: 'critical',
    regex: /rm\s+-rf|rm\s+-r\s+-f|rm\s+--recursive\s+--force/gi,
    fix: 'Remove `rm -rf` from allowed commands. Use a scoped delete list with explicit paths instead.',
  },
  {
    id: 'shell-sudo',
    category: 'Shell Access',
    title: 'Sudo / root escalation allowed',
    description: 'Config permits `sudo` commands, giving the agent full root privileges on the host system.',
    severity: 'critical',
    regex: /\bsudo\b/gi,
    fix: 'Remove `sudo` from allowed commands. Run the agent under a least-privilege user with no sudo access.',
  },
  {
    id: 'shell-chmod-777',
    category: 'Shell Access',
    title: 'World-writable permissions allowed',
    description: 'Config permits `chmod 777` which makes files readable, writable, and executable by any user.',
    severity: 'high',
    regex: /chmod\s+777/gi,
    fix: 'Use specific permissions (e.g., `chmod 644` for files, `chmod 755` for directories). Never use 777.',
  },
  {
    id: 'shell-curl-pipe',
    category: 'Shell Access',
    title: 'Pipe-to-shell execution allowed',
    description: 'Config permits `curl | sh` or `wget | bash` patterns, enabling remote code execution from arbitrary URLs.',
    severity: 'critical',
    regex: /curl\s+.*\|\s*(sh|bash|zsh)|wget\s+.*\|\s*(sh|bash|zsh)/gi,
    fix: 'Disallow pipe-to-shell patterns. Download scripts first, audit them, then execute.',
  },
  {
    id: 'shell-eval',
    category: 'Shell Access',
    title: 'Dynamic code evaluation allowed',
    description: 'Config permits `eval` which executes arbitrary strings as commands, bypassing any command restrictions.',
    severity: 'high',
    regex: /\beval\b\s/gi,
    fix: 'Remove `eval` from allowed commands. Use explicit command lists instead of dynamic evaluation.',
  },
  {
    id: 'shell-dd',
    category: 'Shell Access',
    title: 'Low-level disk write tool allowed',
    description: 'Config permits `dd` which can overwrite disks, partitions, and boot sectors.',
    severity: 'high',
    regex: /\bdd\b\s+if=/gi,
    fix: 'Remove `dd` from allowed commands unless absolutely required, and restrict it to specific devices.',
  },
  {
    id: 'shell-mkfs',
    category: 'Shell Access',
    title: 'Filesystem format command allowed',
    description: 'Config permits `mkfs` which can format and destroy entire filesystems.',
    severity: 'critical',
    regex: /\bmkfs\b/gi,
    fix: 'Remove `mkfs` from allowed commands. This should never be available to an AI agent.',
  },
]

const FILESYSTEM_PATTERNS: Pattern[] = [
  {
    id: 'fs-wildcard-root',
    category: 'File System',
    title: 'Unrestricted root filesystem access',
    description: 'Config grants access to `/**/*` or `/` — the agent can read or write any file on the system including /etc/passwd, SSH keys, and credentials.',
    severity: 'critical',
    regex: /["'`]\/\*\*\/?\*?["'`]|["'`]\/["'`]\s|allowedDirectories.*["'`]\/["'`]/gi,
    fix: 'Restrict file access to the project directory only. Use explicit paths like `/home/user/project/**`.',
  },
  {
    id: 'fs-home-access',
    category: 'File System',
    title: 'Home directory fully accessible',
    description: 'Config grants access to the entire home directory, exposing SSH keys, browser profiles, credentials, and personal files.',
    severity: 'high',
    regex: /~\/\*\*|\/home\/\w+\/\*\*|\/Users\/\w+\/\*\*/gi,
    fix: 'Scope file access to the specific project folder rather than the entire home directory.',
  },
  {
    id: 'fs-sensitive-paths',
    category: 'File System',
    title: 'Sensitive system paths accessible',
    description: 'Config allows access to sensitive directories like /etc, /var, /root, or .ssh which contain system configurations and credentials.',
    severity: 'critical',
    regex: /\/etc\/|\/var\/|\/root\/|\.ssh\/|\.gnupg\/|\.aws\//gi,
    fix: 'Explicitly deny access to system directories. Add these paths to a deny list.',
  },
]

const SECRET_PATTERNS: Pattern[] = [
  {
    id: 'secret-api-key',
    category: 'Secret Exposure',
    title: 'API key or token embedded in config',
    description: 'Config contains what appears to be an API key or token. If this config is version-controlled, the secret is exposed.',
    severity: 'critical',
    regex: /(?:api[_-]?key|api[_-]?token|apikey|secret[_-]?key|auth[_-]?token|access[_-]?token|bearer)\s*[:=]\s*["']?[A-Za-z0-9_\-./+]{16,}["']?/gi,
    fix: 'Move secrets to environment variables. Reference them as `$API_KEY` or `process.env.API_KEY` instead of hardcoding.',
  },
  {
    id: 'secret-aws-key',
    category: 'Secret Exposure',
    title: 'AWS credentials detected',
    description: 'Config contains AWS access key ID or secret access key patterns.',
    severity: 'critical',
    regex: /AKIA[0-9A-Z]{16}|aws[_-]?secret[_-]?access[_-]?key\s*[:=]/gi,
    fix: 'Remove AWS credentials immediately. Use IAM roles or environment variables instead.',
  },
  {
    id: 'secret-private-key',
    category: 'Secret Exposure',
    title: 'Private key material detected',
    description: 'Config contains what appears to be a private key (PEM format or similar).',
    severity: 'critical',
    regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----|-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/gi,
    fix: 'Remove private keys from config files. Store them in a secure vault or use file references.',
  },
  {
    id: 'secret-password',
    category: 'Secret Exposure',
    title: 'Password or passphrase in config',
    description: 'Config contains a hardcoded password or passphrase.',
    severity: 'high',
    regex: /(?:password|passwd|passphrase)\s*[:=]\s*["'][^"']{4,}["']/gi,
    fix: 'Remove passwords from config. Use environment variables or a secrets manager.',
  },
  {
    id: 'secret-openai-key',
    category: 'Secret Exposure',
    title: 'OpenAI API key detected',
    description: 'Config contains an OpenAI API key (sk-proj- or sk- prefix). This key grants access to paid AI API usage.',
    severity: 'critical',
    regex: /sk-proj-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}/gi,
    fix: 'Remove the API key. Use `$OPENAI_API_KEY` environment variable instead of hardcoding the key.',
  },
  {
    id: 'secret-github-token',
    category: 'Secret Exposure',
    title: 'GitHub personal access token detected',
    description: 'Config contains a GitHub token (ghp_ or ghs_ prefix). This could be used to access or modify repositories.',
    severity: 'critical',
    regex: /gh[ps]_[A-Za-z0-9]{36,}/gi,
    fix: 'Remove the token. Use fine-grained tokens with minimal scopes, stored in environment variables.',
  },
]

const MCP_PATTERNS: Pattern[] = [
  {
    id: 'mcp-exec-server',
    category: 'MCP Server Trust',
    title: 'Dangerous MCP server: command execution',
    description: 'Config includes an MCP server with exec/shell/command capabilities. This server can execute arbitrary commands on your system.',
    severity: 'critical',
    regex: /["'](?:@modelcontextprotocol\/server-)?(?:exec|shell|command|terminal|subprocess)["']|mcpServers.*(?:exec|shell|command)/gi,
    fix: 'Remove exec/shell MCP servers. If command execution is needed, use a sandboxed environment with explicit allow-lists.',
  },
  {
    id: 'mcp-filesystem-server',
    category: 'MCP Server Trust',
    title: 'MCP filesystem server with broad access',
    description: 'Config includes an MCP filesystem server. Without path restrictions, this gives the agent unrestricted file access.',
    severity: 'high',
    regex: /["'](?:@modelcontextprotocol\/server-)?filesystem["']|server-filesystem/gi,
    fix: 'If using a filesystem MCP server, configure it with explicit allowed directories. Never grant root-level access.',
  },
  {
    id: 'mcp-puppeteer',
    category: 'MCP Server Trust',
    title: 'Browser automation MCP server detected',
    description: 'Config includes a Puppeteer/Playwright MCP server. This can navigate to arbitrary URLs, fill forms, and exfiltrate data.',
    severity: 'high',
    regex: /["'](?:@modelcontextprotocol\/server-)?(?:puppeteer|playwright|browser|selenium)["']/gi,
    fix: 'Restrict browser MCP servers to specific domains. Add URL allowlists and disable credential auto-fill.',
  },
  {
    id: 'mcp-github-token',
    category: 'MCP Server Trust',
    title: 'MCP server with GitHub token access',
    description: 'Config passes a GitHub token to an MCP server. This could be used to modify repos, create issues, or access private code.',
    severity: 'high',
    regex: /GITHUB_TOKEN|GITHUB_PERSONAL_ACCESS_TOKEN|gh[ps]_[A-Za-z0-9_]{36,}/gi,
    fix: 'Use fine-grained GitHub tokens with minimal scopes. Restrict to specific repos and read-only where possible.',
  },
  {
    id: 'mcp-no-auth',
    category: 'MCP Server Trust',
    title: 'MCP server without authentication',
    description: 'MCP server connection appears to lack authentication. Any process on the network could impersonate the server.',
    severity: 'medium',
    regex: /url["']?\s*[:=]\s*["']https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+["']/gi,
    fix: 'Add authentication tokens to MCP server connections. Use HTTPS with mutual TLS for remote servers.',
  },
]

const SAFETY_PATTERNS: Pattern[] = [
  {
    id: 'safety-no-deny',
    category: 'Tool Restrictions',
    title: 'No deny rules configured',
    description: 'Config has no deny/block/disallow rules. Without explicit restrictions, the agent may use any available tool or command.',
    severity: 'high',
    regex: /placeholder_no_deny/gi, // special: checked via absence
    fix: 'Add explicit deny rules for dangerous operations: `deny: ["rm -rf", "sudo", "chmod 777", "> /dev/"]`.',
  },
  {
    id: 'safety-no-guardrails',
    category: 'Tool Restrictions',
    title: 'No safety instructions found',
    description: 'Config lacks safety guardrails, boundary definitions, or restriction clauses. The agent operates without behavioral constraints.',
    severity: 'medium',
    regex: /placeholder_no_guardrails/gi, // special: checked via absence
    fix: 'Add safety instructions: "Never modify files outside the project directory. Never execute destructive commands. Always confirm before making system changes."',
  },
]

const PERMISSION_PATTERNS: Pattern[] = [
  {
    id: 'perm-any-command',
    category: 'Shell Access',
    title: 'Unrestricted command execution granted',
    description: 'Config explicitly grants the agent permission to run "any" command. This is equivalent to giving it root shell access.',
    severity: 'critical',
    regex: /(?:run|execute|use)\s+any\s+(?:bash\s+)?command|any\s+command\s+needed|full\s+shell\s+access/gi,
    fix: 'Replace "any command" with an explicit allowlist of safe commands the agent actually needs.',
  },
  {
    id: 'perm-full-access',
    category: 'File System',
    title: 'Full or unrestricted access granted',
    description: 'Config explicitly grants "full access" to the system or filesystem without scoping.',
    severity: 'high',
    regex: /full\s+access|unrestricted\s+access|access\s+to\s+(?:the\s+)?entire|access\s+to\s+everything/gi,
    fix: 'Scope access to the specific project directory. Never grant blanket "full access" permissions.',
  },
]

const NETWORK_PATTERNS: Pattern[] = [
  {
    id: 'net-unrestricted',
    category: 'Network Access',
    title: 'Unrestricted network/internet access',
    description: 'Config grants broad network access without domain restrictions. The agent could exfiltrate data to arbitrary endpoints.',
    severity: 'high',
    regex: /allowedDomains.*\*|network.*unrestricted|internet.*access.*true|fetch.*any|allowedUrls.*\*/gi,
    fix: 'Restrict network access to specific domains needed for the project. Block outbound connections by default.',
  },
  {
    id: 'net-webhook-expose',
    category: 'Network Access',
    title: 'Webhook or tunnel exposure detected',
    description: 'Config references ngrok, localtunnel, or webhook endpoints that expose local services to the internet.',
    severity: 'medium',
    regex: /ngrok|localtunnel|cloudflared\s+tunnel|webhook.*url/gi,
    fix: 'Avoid exposing local services. If tunnels are needed, use authentication and restrict to specific endpoints.',
  },
]

const RATE_LIMIT_PATTERNS: Pattern[] = [
  {
    id: 'rate-no-limits',
    category: 'Rate Limiting',
    title: 'No rate limits or usage caps configured',
    description: 'Config has no rate limits, usage caps, or cost guards. The agent could make unlimited API calls, racking up costs.',
    severity: 'medium',
    regex: /placeholder_no_rate_limits/gi, // special: checked via absence
    fix: 'Add rate limits: max requests per minute, daily cost caps, and token usage limits.',
  },
]

const AUDIT_PATTERNS: Pattern[] = [
  {
    id: 'audit-no-logging',
    category: 'Audit Logging',
    title: 'No audit logging configured',
    description: 'Config has no logging, audit trail, or monitoring configuration. Actions taken by the agent are untrackable.',
    severity: 'medium',
    regex: /placeholder_no_logging/gi, // special: checked via absence
    fix: 'Enable audit logging for all agent actions. Log commands executed, files modified, and API calls made.',
  },
]

const ALL_PATTERNS = [
  ...DANGEROUS_COMMANDS,
  ...FILESYSTEM_PATTERNS,
  ...SECRET_PATTERNS,
  ...MCP_PATTERNS,
  ...PERMISSION_PATTERNS,
  ...NETWORK_PATTERNS,
]

// ── Auto-detect config type ──────────────────────────────────────────

function detectConfigType(content: string): ConfigType {
  const lower = content.toLowerCase()
  if (lower.includes('claude') || lower.includes('anthropic') || lower.includes('claude.md') || lower.includes('agents.md')) return 'claude'
  if (lower.includes('cursorrules') || lower.includes('.cursor') || lower.includes('cursor')) return 'cursor'
  if (lower.includes('mcpservers') || lower.includes('mcp_servers') || lower.includes('modelcontextprotocol')) return 'mcp'
  if (lower.includes('allowedtools') || lower.includes('allowed_tools')) return 'claude'
  return 'auto'
}

// ── Check for absence-based issues ───────────────────────────────────

function checkAbsencePatterns(content: string): Issue[] {
  const issues: Issue[] = []
  const lower = content.toLowerCase()

  // No deny rules
  const hasDeny = /deny|block|disallow|forbidden|restrict|blacklist|not\s+allowed|never\s+use|do\s+not|don't/i.test(content)
  if (!hasDeny) {
    issues.push({
      id: 'safety-no-deny',
      category: 'Tool Restrictions',
      title: 'No deny rules configured',
      description: 'Config has no deny/block/disallow rules. Without explicit restrictions, the agent may use any available tool or command.',
      severity: 'high',
      fix: 'Add explicit deny rules for dangerous operations: `deny: ["rm -rf", "sudo", "chmod 777", "> /dev/"]`.',
    })
  }

  // No safety guardrails
  const hasSafety = /safe|guard|boundar|restrict|limit|constraint|careful|caution|warning|security|protect/i.test(content)
  if (!hasSafety) {
    issues.push({
      id: 'safety-no-guardrails',
      category: 'Tool Restrictions',
      title: 'No safety instructions found',
      description: 'Config lacks safety guardrails, boundary definitions, or restriction clauses. The agent operates without behavioral constraints.',
      severity: 'medium',
      fix: 'Add safety instructions: "Never modify files outside the project directory. Never execute destructive commands. Always confirm before making system changes."',
    })
  }

  // No rate limits
  const hasRateLimit = /rate.?limit|throttl|max.?request|cost.?cap|usage.?limit|budget|quota|token.?limit/i.test(content)
  if (!hasRateLimit) {
    issues.push({
      id: 'rate-no-limits',
      category: 'Rate Limiting',
      title: 'No rate limits or usage caps configured',
      description: 'Config has no rate limits, usage caps, or cost guards. The agent could make unlimited API calls, racking up costs.',
      severity: 'medium',
      fix: 'Add rate limits: max requests per minute, daily cost caps, and token usage limits.',
    })
  }

  // No audit logging
  const hasAudit = /log|audit|monitor|track|record|history|trace/i.test(content)
  if (!hasAudit) {
    issues.push({
      id: 'audit-no-logging',
      category: 'Audit Logging',
      title: 'No audit logging configured',
      description: 'Config has no logging, audit trail, or monitoring configuration. Actions taken by the agent are untrackable.',
      severity: 'medium',
      fix: 'Enable audit logging for all agent actions. Log commands executed, files modified, and API calls made.',
    })
  }

  return issues
}

// ── Find line number of match ────────────────────────────────────────

function findLineNumber(content: string, match: RegExpMatchArray): number | undefined {
  if (match.index === undefined) return undefined
  const upToMatch = content.slice(0, match.index)
  return upToMatch.split('\n').length
}

function extractSnippet(content: string, match: RegExpMatchArray): string | undefined {
  if (match.index === undefined) return undefined
  const start = Math.max(0, match.index - 40)
  const end = Math.min(content.length, match.index + match[0].length + 40)
  let snippet = content.slice(start, end).replace(/\n/g, ' ')
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'
  return snippet
}

// ── Main scanner ─────────────────────────────────────────────────────

export function scanConfig(content: string, type: ConfigType = 'auto'): ScanResult {
  const configType = type === 'auto' ? detectConfigType(content) : type
  const issues: Issue[] = []
  const seenIds = new Set<string>()

  // Run regex patterns
  for (const pattern of ALL_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    const matches = content.matchAll(regex)

    for (const match of matches) {
      if (seenIds.has(pattern.id)) continue
      seenIds.add(pattern.id)

      issues.push({
        id: pattern.id,
        category: pattern.category,
        title: pattern.title,
        description: pattern.description,
        severity: pattern.severity,
        line: findLineNumber(content, match),
        snippet: extractSnippet(content, match),
        fix: pattern.fix,
      })
    }
  }

  // Run absence checks
  const absenceIssues = checkAbsencePatterns(content)
  for (const issue of absenceIssues) {
    if (!seenIds.has(issue.id)) {
      seenIds.add(issue.id)
      issues.push(issue)
    }
  }

  // Sort by severity
  const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // Calculate score (0-100, higher = safer)
  let deductions = 0
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical': deductions += 25; break
      case 'high': deductions += 15; break
      case 'medium': deductions += 8; break
      case 'low': deductions += 3; break
    }
  }
  const score = Math.max(0, 100 - deductions)

  // Grade
  let grade: RiskGrade
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 55) grade = 'C'
  else if (score >= 35) grade = 'D'
  else grade = 'F'

  // Summary
  const critCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length
  let summary: string
  if (score >= 90) {
    summary = 'Your agent config looks well-secured. Minor improvements possible.'
  } else if (score >= 75) {
    summary = `Decent security posture with ${highCount} high-severity issue${highCount !== 1 ? 's' : ''} to address.`
  } else if (score >= 55) {
    summary = `Significant security gaps found. ${critCount} critical and ${highCount} high-severity issues need immediate attention.`
  } else if (score >= 35) {
    summary = `Serious security risks detected. Your agent has dangerous permissions that could lead to data loss or system compromise.`
  } else {
    summary = `Critical security failure. Your agent config has severe vulnerabilities — it has more access than most sysadmins. Immediate remediation required.`
  }

  return {
    grade,
    score,
    configType,
    totalIssues: issues.length,
    issues,
    summary,
  }
}

// ── Best practices checklist ─────────────────────────────────────────

export interface BestPractice {
  category: string
  title: string
  description: string
  passed: boolean
}

export function generateBestPractices(content: string): BestPractice[] {
  const lower = content.toLowerCase()

  return [
    {
      category: 'Principle of Least Privilege',
      title: 'Scoped file access',
      description: 'Agent file access is limited to the project directory.',
      passed: !(/\/\*\*\/?\*/.test(content) || /~\/\*\*/.test(content)),
    },
    {
      category: 'Principle of Least Privilege',
      title: 'No root/sudo access',
      description: 'Agent cannot escalate to root privileges.',
      passed: !/\bsudo\b/.test(lower),
    },
    {
      category: 'Defense in Depth',
      title: 'Deny rules present',
      description: 'Config includes explicit deny/block rules for dangerous operations.',
      passed: /deny|block|disallow|forbidden|never\s+use/i.test(content),
    },
    {
      category: 'Defense in Depth',
      title: 'Safety instructions included',
      description: 'Config includes safety guardrails and behavioral constraints.',
      passed: /safe|guard|boundar|restrict|careful|security|protect/i.test(content),
    },
    {
      category: 'Secret Management',
      title: 'No hardcoded secrets',
      description: 'No API keys, tokens, or passwords are embedded in the config.',
      passed: !/(?:api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_\-./+]{16,}["']/i.test(content),
    },
    {
      category: 'Secret Management',
      title: 'Environment variable references',
      description: 'Secrets are referenced via environment variables.',
      passed: /\$[A-Z_]+|\$\{[A-Z_]+\}|process\.env\.|env\./i.test(content),
    },
    {
      category: 'MCP Security',
      title: 'MCP servers are trusted',
      description: 'No exec/shell/command MCP servers are configured.',
      passed: !/(?:exec|shell|command|terminal|subprocess)/i.test(content) || !/mcp/i.test(content),
    },
    {
      category: 'Monitoring',
      title: 'Audit logging enabled',
      description: 'Config includes logging or audit trail configuration.',
      passed: /log|audit|monitor|track|record/i.test(content),
    },
    {
      category: 'Monitoring',
      title: 'Rate limits configured',
      description: 'Config includes rate limits or usage caps.',
      passed: /rate.?limit|throttl|max.?request|cost.?cap|usage.?limit|budget|quota/i.test(content),
    },
    {
      category: 'Network Security',
      title: 'Network access is scoped',
      description: 'Network/internet access is restricted to specific domains.',
      passed: !/allowedDomains.*\*|network.*unrestricted|internet.*access.*true/i.test(content),
    },
  ]
}
