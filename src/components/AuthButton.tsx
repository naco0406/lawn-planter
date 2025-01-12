'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Github, LogOut } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FC } from 'react'

export const AuthButton: FC = () => {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        )
    }

    if (session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={session.user?.image ?? ''}
                                alt={session.user?.name ?? ''}
                            />
                            <AvatarFallback className="bg-emerald-500">
                                {session.user?.name
                                    ?.split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase() ?? '??'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {session.user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signOut()}
                        className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>로그아웃</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Button
            variant="default"
            onClick={() => signIn('github')}
            className="gap-2"
        >
            <Github className="h-5 w-5" />
            Github로 로그인
        </Button>
    )
}