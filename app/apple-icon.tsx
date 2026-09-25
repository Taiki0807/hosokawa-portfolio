import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #7a6fe0 0%, #342c7a 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <span
        style={{
          color: '#f5f4fb',
          fontSize: 104,
          fontWeight: 800,
        }}
      >
        H
      </span>
      <div
        style={{
          position: 'absolute',
          top: 22,
          right: 22,
          width: 32,
          height: 32,
          borderRadius: 999,
          background: '#cbeb4d',
        }}
      />
    </div>,
    size
  )
}
