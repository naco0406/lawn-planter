'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MarkdownIt from 'markdown-it'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, PenLine, Eye, Save } from 'lucide-react'
import Header from '@/components/Header'

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
}).enable(['emphasis', 'list']);

export default function DiaryPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!session?.accessToken) return;
        if (!content.trim()) {
            setError('일기 내용을 입력해주세요.')
            return;
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const date = new Date().toISOString().split('T')[0]
            const response = await fetch('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    filename: `diary/${date}.md`
                })
            })

            const errorData = await response.text()

            if (!response.ok) {
                throw new Error(errorData || '커밋 실패')
            }

            router.push('/')
        } catch (error) {
            console.error(error)
            setError('일기 커밋 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!session) {
        router.push('/')
        return null
    }

    const renderedContent = md.render(content)

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-muted">
            <Header />

            <div className="max-w-5xl mx-auto py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <PenLine className="h-6 w-6 text-emerald-500" />
                                <CardTitle className="text-2xl">오늘의 일기</CardTitle>
                            </div>
                            <CardDescription className="text-base mt-2">
                                마크다운으로 오늘 하루를 기록해보세요 ✨
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="write" className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <TabsList className="h-11">
                                        <TabsTrigger value="write" className="flex items-center gap-2">
                                            <PenLine className="h-4 w-4" />
                                            작성하기
                                        </TabsTrigger>
                                        <TabsTrigger value="preview" className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            미리보기
                                        </TabsTrigger>
                                    </TabsList>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                커밋 중...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                커밋하기
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                <TabsContent value="write" className="mt-0">
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="마크다운으로 작성해보세요..."
                                        className="min-h-[500px] font-mono text-base"
                                    />
                                </TabsContent>

                                <TabsContent value="preview" className="mt-0">
                                    <Card className="border-2">
                                        <ScrollArea className="h-[500px] w-full rounded-md">
                                            <div
                                                className="prose prose-slate dark:prose-invert max-w-none p-6"
                                                dangerouslySetInnerHTML={{ __html: renderedContent }}
                                            />
                                        </ScrollArea>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            <Separator className="my-6" />

                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium text-base mb-3">마크다운 문법 가이드</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">기본 문법</p>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            <li># 제목 (H1)</li>
                                            <li>## 부제목 (H2)</li>
                                            <li>**굵게**, *기울임*</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">고급 문법</p>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            <li>- 목록</li>
                                            <li>1. 숫자 목록</li>
                                            <li>[링크](URL)</li>
                                            <li>![이미지](URL)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}