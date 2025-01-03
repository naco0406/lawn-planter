// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  headers();
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}