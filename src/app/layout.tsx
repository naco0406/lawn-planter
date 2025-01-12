import { Provider } from '@/components/Provider'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lawn Diary',
  description: '매일 일기를 쓰고 깃허브 잔디를 가꿔보세요',
  manifest: '/manifest.json',
  icons: {
    apple: [
      { url: '/lawn_logo.png' },
    ],
  },
  themeColor: '#6EE7B7',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  headers();
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <head>
        <meta name="application-name" content="Lawn Diary" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lawn Diary" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6EE7B7" />

        <link rel="apple-touch-icon" href="/lawn_logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Provider session={session}>
          {children}
        </Provider>
      </body>
    </html>
  )
}