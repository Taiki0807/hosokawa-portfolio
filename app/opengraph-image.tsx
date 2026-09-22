import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#f4f3fb',
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
          background: 'linear-gradient(135deg, #7a6fe0 0%, #342c7a 100%)',
          borderRadius: 16,
          padding: '16px 28px',
          color: '#f5f4fb',
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
          color: '#0a0a12',
          marginBottom: 16,
        }}
      >
        Hosokawa.dev
      </div>
      <div
        style={{
          fontSize: 24,
          color: '#5b5872',
        }}
      >
        フルスタックエンジニア
      </div>
    </div>,
    size
  )
}
