/**
 * Multi-Chain USDC Payment Verification API Route
 *
 * Copy this to your product's app/api/verify-payment/route.ts
 *
 * Verifies USDC transfers on Base, Ethereum, and Polygon.
 * Supports Revolut (Ethereum/Polygon), Coinbase (Base), and any USDC wallet.
 */

// Network configurations — same wallet works on all EVM chains
const NETWORKS: Record<string, { rpc: string; usdc: string; name: string }> = {
  base: {
    rpc: 'https://mainnet.base.org',
    usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    name: 'Base',
  },
  ethereum: {
    rpc: 'https://cloudflare-eth.com',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'Ethereum',
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    usdc: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    name: 'Polygon',
  },
}

const USDC_DECIMALS = 6
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

async function rpcCall(rpcUrl: string, method: string, params: unknown[]) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function verifyOnNetwork(
  txHash: string,
  expectedAmount: number,
  expectedWallet: string,
  networkId: string
) {
  const network = NETWORKS[networkId]
  if (!network) return { verified: false, error: `Unknown network: ${networkId}` }

  // 1. Get transaction receipt
  const receipt = await rpcCall(network.rpc, 'eth_getTransactionReceipt', [txHash])

  if (!receipt) {
    return {
      verified: false,
      error: `Transaction not found on ${network.name}. It may still be pending — wait a moment and try again.`,
    }
  }

  // 2. Check tx succeeded
  if (receipt.status !== '0x1') {
    return { verified: false, error: `Transaction failed on ${network.name}.` }
  }

  // 3. Find USDC Transfer event log
  const transferLog = receipt.logs?.find((log: { address: string; topics: string[] }) => {
    return (
      log.address.toLowerCase() === network.usdc.toLowerCase() &&
      log.topics[0] === TRANSFER_TOPIC
    )
  })

  if (!transferLog) {
    return {
      verified: false,
      error: `No USDC transfer found on ${network.name}. Make sure you sent USDC (not ETH or another token).`,
    }
  }

  // 4. Verify recipient
  const toAddress = '0x' + transferLog.topics[2].slice(26).toLowerCase()
  if (toAddress !== expectedWallet.toLowerCase()) {
    return {
      verified: false,
      error: 'Payment was sent to a different address.',
    }
  }

  // 5. Verify amount
  const rawAmount = parseInt(transferLog.data, 16)
  const usdcAmount = rawAmount / Math.pow(10, USDC_DECIMALS)
  const minAmount = expectedAmount * 0.99

  if (usdcAmount < minAmount) {
    return {
      verified: false,
      error: `Insufficient amount. Expected $${expectedAmount} USDC, received $${usdcAmount.toFixed(2)} USDC.`,
    }
  }

  // 6. Check confirmations
  const currentBlock = await rpcCall(network.rpc, 'eth_blockNumber', [])
  const txBlock = parseInt(receipt.blockNumber, 16)
  const confirmations = parseInt(currentBlock, 16) - txBlock

  if (confirmations < 1) {
    return {
      verified: false,
      error: 'Transaction pending confirmation. Please wait a few seconds and try again.',
    }
  }

  return {
    verified: true,
    network: network.name,
    amount: usdcAmount,
    confirmations,
    blockNumber: txBlock,
    from: '0x' + transferLog.topics[1].slice(26),
    to: toAddress,
  }
}

export async function POST(request: Request) {
  try {
    const { txHash, expectedAmount, expectedWallet, network } = await request.json()

    if (!txHash || !expectedAmount || !expectedWallet) {
      return Response.json({ verified: false, error: 'Missing required fields' }, { status: 400 })
    }

    // If network specified, check only that network
    if (network && NETWORKS[network]) {
      const result = await verifyOnNetwork(txHash, expectedAmount, expectedWallet, network)
      return Response.json(result)
    }

    // Auto-detect: try all networks in parallel
    const results = await Promise.allSettled(
      Object.keys(NETWORKS).map((net) =>
        verifyOnNetwork(txHash, expectedAmount, expectedWallet, net)
      )
    )

    // Return first verified result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.verified) {
        return Response.json(result.value)
      }
    }

    // No network verified — return helpful error
    return Response.json({
      verified: false,
      error:
        'Transaction not found on Base, Ethereum, or Polygon. Please check the transaction hash and ensure you sent USDC on one of these networks.',
      supportedNetworks: ['Base', 'Ethereum', 'Polygon'],
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return Response.json(
      { verified: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
