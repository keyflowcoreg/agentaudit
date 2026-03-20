'use client'

interface Product {
  name: string
  description: string
  href: string
  price?: string
}

const PRODUCTS: Product[] = [
  { name: 'RulesForge', description: 'AI coding rules generator', href: 'https://rulesforge.vercel.app', price: '$29' },
  { name: 'AgentAudit', description: 'AI agent security scanner', href: 'https://agentaudit-five.vercel.app', price: 'Free scan' },
  { name: 'CryptoPayKit', description: 'x402 crypto payment toolkit', href: 'https://cryptopaykit.vercel.app', price: '$49' },
  { name: 'PromptForge', description: '200+ AI prompts library', href: 'https://promptforge-indol.vercel.app', price: '$19' },
  { name: 'PageForge', description: 'AI landing page generator', href: 'https://pageforge-phi.vercel.app', price: '$29' },
  { name: 'OGForge', description: 'AI social card generator', href: 'https://ogforge.vercel.app', price: '$9' },
  { name: 'ScreenForge', description: 'App Store screenshots', href: 'https://screenforge-ten.vercel.app', price: '$19' },
  { name: 'AIToolsRadar', description: 'Compare 40+ AI tools', href: 'https://aitoolsradar-zeta.vercel.app', price: 'Free' },
]

interface EcosystemFooterProps {
  currentProduct?: string // name of the current product to exclude from the list
}

export function EcosystemFooter({ currentProduct }: EcosystemFooterProps) {
  const otherProducts = PRODUCTS.filter(p => p.name !== currentProduct)

  return (
    <section className="border-t border-zinc-800/50 mt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-sm text-zinc-500 uppercase tracking-wider">From AI Business Factory</p>
          <h3 className="mt-2 text-lg font-bold text-white tracking-tight">More tools for builders</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {otherProducts.map((product) => (
            <a
              key={product.name}
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900/60"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-white group-hover:text-zinc-100">{product.name}</span>
                {product.price && <span className="text-xs text-zinc-500">{product.price}</span>}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{product.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} AI Business Factory. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <span>Card, Apple Pay, USDC accepted</span>
          </div>
        </div>
      </div>
    </section>
  )
}
