import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'AgentAudit'

  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#09090b', color: 'white',
        fontSize: 60, fontWeight: 700, letterSpacing: '-0.03em',
        padding: '40px 80px',
      }}>
        <div style={{ fontSize: 24, color: '#a1a1aa', marginBottom: 20 }}>
          AgentAudit
        </div>
        <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 16, color: '#52525b', marginTop: 30 }}>
          AI Business Factory
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
