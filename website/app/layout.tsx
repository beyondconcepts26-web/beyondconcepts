import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Beyond Concepts — Web Design & Development Studio',
  description: 'Australian web studio crafting high-performance digital experiences. Web design, development, branding, SEO, and ongoing support.',
  keywords: ['web design', 'web development', 'Australian web studio', 'branding', 'SEO'],
  openGraph: {
    title: 'Beyond Concepts — Web Design & Development Studio',
    description: 'We build websites that go beyond.',
    url: 'https://beyondconcepts.com.au',
    siteName: 'Beyond Concepts',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
