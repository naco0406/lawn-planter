'use client'
// src/components/SessionProvider.tsx
import { SessionProvider as Provider } from 'next-auth/react'

export default function SessionProvider({ children, session }: {
    children: React.ReactNode;
    session: any;
}) {
    return (
        <Provider session={session}
            refetchInterval={0} // 자동 갱신 비활성화
            refetchWhenOffline={false} // 오프라인일 때 갱신 시도 안 함
            refetchOnWindowFocus={false}>
            {children}
        </Provider>
    )
}