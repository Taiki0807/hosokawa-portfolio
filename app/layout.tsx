import type { Metadata } from 'next'
import { Noto_Sans_JP, DM_Mono } from 'next/font/google'
import './globals.css'
import ResponsiveNav from '@/components/Home/NavBar/ResponsiveNav'
import { profile } from '@/data'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: `${profile.name}.dev`,
    template: `%s | ${profile.name}.dev`,
  },
  description: profile.bio,
  openGraph: {
    title: `${profile.name}.dev`,
    description: profile.bio,
    url: 'https://hosokawa-lab.dev',
    siteName: `${profile.name}.dev`,
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${dmMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ResponsiveNav />
        {children}
      </body>
    </html>
  )
}
