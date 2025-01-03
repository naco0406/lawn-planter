'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MarkdownIt from 'markdown-it'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw } from 'lucide-react'

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
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">오늘의 일기</CardTitle>
                    <CardDescription>
                        마크다운으로 오늘 하루를 기록해보세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="write" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="write">작성하기</TabsTrigger>
                                <TabsTrigger value="preview">미리보기</TabsTrigger>
                            </TabsList>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="ml-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        커밋 중...
                                    </>
                                ) : (
                                    '커밋하기'
                                )}
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <TabsContent value="write" className="mt-0">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="마크다운으로 작성해보세요..."
                                className="min-h-[500px] font-mono"
                            />
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                            <Card>
                                <ScrollArea className="h-[500px] w-full rounded-md border">
                                    <div
                                        className="prose prose-slate dark:prose-invert max-w-none p-4"
                                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                                    />
                                </ScrollArea>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <Separator className="my-4" />

                    <div className="text-sm text-muted-foreground">
                        <p>마크다운 문법을 지원합니다:</p>
                        <ul className="list-disc list-inside mt-2">
                            <li># 제목</li>
                            <li>**굵게**, *기울임*</li>
                            <li>- 목록</li>
                            <li>[링크](URL)</li>
                            <li>![이미지](URL)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}