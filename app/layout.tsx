import type { Metadata, Viewport } from 'next'
import { Rajdhani, Orbitron, Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-rajdhani' })
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'Scrim List Generator',
  description: 'Create professional esports scrim team lists and generate animated announcements',
  icons: {
    icon: '/logo.png',
  },
}
export const viewport: Viewport = {
  themeColor: '#1a0a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  )
}
