'use client'
// src/app/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'
import CreateRepoModal from '@/components/CreateRepoModal'
import { checkRepository, createRepository } from '@/lib/github'

export default function Home() {
  const { data: session } = useSession()
  const [hasRepo, setHasRepo] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkUserRepo = async () => {
      if (session?.accessToken && hasRepo === null) {
        try {
          const exists = await checkRepository(session.accessToken)
          setHasRepo(exists)
        } catch (error) {
          console.error('Repository check failed:', error)
          setHasRepo(false)
        }
      }
    }

    checkUserRepo()
  }, [session?.accessToken, hasRepo])

  const handleCreateRepo = async () => {
    if (!session?.accessToken) return;

    try {
      await createRepository(session.accessToken)
      setHasRepo(true)
      setShowModal(false)
    } catch (error) {
      console.error('Repository creation failed:', error)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Github 잔디 심기</h1>
          <AuthButton />
        </div>

        {session && hasRepo === null && (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {session && hasRepo === false && (
          <div className="mb-8 p-6 bg-yellow-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">저장소 생성 필요</h2>
            <p className="mb-4">일기를 저장할 lawn-diary 저장소가 필요합니다.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              저장소 생성하기
            </button>
          </div>
        )}

        {session && hasRepo && (
          <Link
            href="/diary"
            className="block p-6 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">오늘의 일기 쓰기</h2>
            <p className="text-gray-600">마크다운으로 일기를 작성하고 Github에 커밋하세요</p>
          </Link>
        )}
      </div>

      <CreateRepoModal
        isOpen={showModal}
        onConfirm={handleCreateRepo}
        onCancel={() => setShowModal(false)}
      />
    </main>
  )
}