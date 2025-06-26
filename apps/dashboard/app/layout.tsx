import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from './providers/trpc-provider'
import { Navigation } from './components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Neon AI Dashboard',
  description: 'AI Agent Training, Asset Management, and System Settings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto py-6">
              {children}
            </main>
          </div>
        </TRPCProvider>
      </body>
    </html>
  )
} 