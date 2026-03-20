/**
 * USDC Payment Verification API Route
 *
 * Copy this to your product's app/api/verify-payment/route.ts
 *
 * Verifies a USDC transfer on Base by checking the transaction receipt on-chain.
 * Validates: recipient address, token contract, amount, and confirmation status.
 */

const BASE_RPC = 'https://mainnet.base.org'
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()
const USDC_DECIMALS = 6

// ERC-20 Transfer event topic
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

export async function POST(request: Request) {
  try {
    const { txHash, expectedAmount, expectedWallet } = await request.json()

    if (!txHash || !expectedAmount || !expectedWallet) {
      return Response.json({ verified: false, error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Get transaction receipt
    const receipt = await rpcCall('eth_getTransactionReceipt', [txHash])

    if (!receipt) {
      return Response.json({
        verified: false,
        error: 'Transaction not found. It may still be pending — please wait a moment and try again.',
      })
    }

    // 2. Check tx succeeded
    if (receipt.status !== '0x1') {
      return Response.json({ verified: false, error: 'Transaction failed on-chain.' })
    }

    // 3. Find USDC Transfer event log
    const transferLog = receipt.logs?.find((log: { address: string; topics: string[] }) => {
      return (
        log.address.toLowerCase() === USDC_CONTRACT &&
        log.topics[0] === TRANSFER_TOPIC
      )
    })

    if (!transferLog) {
      return Response.json({
        verified: false,
        error: 'No USDC transfer found in this transaction. Make sure you sent USDC on Base network.',
      })
    }

    // 4. Verify recipient (topic[2] = to address, padded to 32 bytes)
    const toAddress = '0x' + transferLog.topics[2].slice(26).toLowerCase()
    if (toAddress !== expectedWallet.toLowerCase()) {
      return Response.json({
        verified: false,
        error: 'Payment was sent to a different address. Please send to the correct wallet.',
      })
    }

    // 5. Verify amount (data field contains the amount)
    const rawAmount = parseInt(transferLog.data, 16)
    const usdcAmount = rawAmount / Math.pow(10, USDC_DECIMALS)
    const minAmount = expectedAmount * 0.99 // 1% tolerance for rounding

    if (usdcAmount < minAmount) {
      return Response.json({
        verified: false,
        error: `Insufficient amount. Expected $${expectedAmount} USDC, received $${usdcAmount.toFixed(2)} USDC.`,
      })
    }

    // 6. Check confirmations (at least 1 block confirmed)
    const currentBlock = await rpcCall('eth_blockNumber', [])
    const txBlock = parseInt(receipt.blockNumber, 16)
    const currentBlockNum = parseInt(currentBlock, 16)
    const confirmations = currentBlockNum - txBlock

    if (confirmations < 1) {
      return Response.json({
        verified: false,
        error: 'Transaction is still pending confirmation. Please wait a few seconds and try again.',
      })
    }

    // All checks passed
    return Response.json({
      verified: true,
      amount: usdcAmount,
      confirmations,
      blockNumber: txBlock,
      from: '0x' + transferLog.topics[1].slice(26),
      to: toAddress,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return Response.json(
      { verified: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
