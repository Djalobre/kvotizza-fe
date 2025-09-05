import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/theme-context'
import { ThemeScript } from '@/components/theme-script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kvotizza - Pametno poređenje kvota',
  description: 'Uporedi kvote svih kladionica u Srbiji u realnom vremenu',
  icons: {
    icon: '/logo.png', // or .png/.svg
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
