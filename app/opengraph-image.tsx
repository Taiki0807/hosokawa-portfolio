import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          background: '#6c4ff6',
          borderRadius: 16,
          padding: '16px 28px',
          color: 'white',
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 32,
        }}
      >
        /Hosokawa-lab
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: '#1a1a2e',
          marginBottom: 16,
        }}
      >
        Hosokawa.dev
      </div>
      <div
        style={{
          fontSize: 24,
          color: '#6b6b8a',
        }}
      >
        フルスタックエンジニア
      </div>
    </div>,
    size
  )
}
