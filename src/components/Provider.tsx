'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { SessionProvider } from 'next-auth/react'

interface Props {
    children: React.ReactNode;
    session: any;
}
export const Provider: FC<Props> = ({ children, session }) => {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider session={session}>
                {children}
            </SessionProvider>
        </QueryClientProvider>
    )
}