// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import { headers } from 'next/headers'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  headers();
  // const session = await getServerSession();
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'Lawn Diary',
  description: '매일 일기를 쓰고 깃허브 잔디를 가꿔보세요',
}