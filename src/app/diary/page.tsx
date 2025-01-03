'use client'
// src/app/diary/page.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt();

export default function DiaryPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [content, setContent] = useState('')
    const [preview, setPreview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!session?.accessToken) return;

        setIsSubmitting(true)
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
            console.error('Response:', response.status, errorData)

            if (!response.ok) throw new Error('커밋 실패')

            router.push('/')
        } catch (error) {
            console.error(error)
            alert('일기 커밋 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePreview = () => {
        setPreview(md.render(content))
    }

    if (!session) {
        router.push('/')
        return null
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">오늘의 일기</h1>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-96 p-4 border rounded"
                        placeholder="마크다운으로 작성해보세요..."
                    />
                </div>

                <div>
                    <button
                        onClick={handlePreview}
                        className="mb-2 px-4 py-1 bg-gray-200 rounded"
                    >
                        미리보기
                    </button>
                    <div
                        className="prose w-full h-96 p-4 border rounded overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: preview }}
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
                {isSubmitting ? '커밋 중...' : '커밋하기'}
            </button>
        </div>
    )
}