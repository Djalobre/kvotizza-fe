import type { Metadata } from 'next'
import './globals.css'
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider" // Assuming this path is correct

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: 'Kvotizza',
  description: 'Uporedi kvote za sportsko klađenje',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        </body>
    </html>
  )
}
