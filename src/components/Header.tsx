import React, { FC } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { AuthButton } from './AuthButton';

export const Header: FC = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navigationItems = [
        { href: '/', label: '홈' },
        // 세션이 있을 때만 일기 작성 탭 표시
        ...(session ? [{ href: '/diary', label: '일기 작성' }] : []),
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex h-14 items-center justify-between">
                    {/* Left section with Logo and Navigation */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <Github className="h-5 w-5" />
                            <span className="text-lg font-semibold">Github 잔디 심기</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:block">
                            <Tabs value={pathname}>
                                <TabsList className="bg-transparent border-none">
                                    {navigationItems.map((item) => (
                                        <Link href={item.href} key={item.href}>
                                            <TabsTrigger
                                                value={item.href}
                                                className={cn(
                                                    "relative data-[state=active]:bg-transparent",
                                                    pathname === item.href &&
                                                    "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600"
                                                )}
                                            >
                                                {item.label}
                                            </TabsTrigger>
                                        </Link>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="sm:hidden flex items-center space-x-4">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium",
                                    pathname === item.href
                                        ? "text-emerald-600"
                                        : "text-gray-700 hover:text-emerald-600"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Button (Right-aligned) */}
                    <div className="flex items-center">
                        <AuthButton />
                    </div>
                </div>
            </div>
        </header>
    );
};
