// src/lib/auth.ts
import { AuthOptions, Session } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authOptions: AuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'repo user',
                },
            },
        }),
    ],
    session: {
        strategy: "jwt", // JWT 전략 사용
        maxAge: 30 * 24 * 60 * 60, // 30일
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // 초기 로그인 시
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    user: {
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            return {
              ...session,
              accessToken: token.accessToken
            } as Session
          }
    },
}