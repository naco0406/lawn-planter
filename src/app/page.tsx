'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Github, BookOpenCheck, AlertCircle, Loader2 } from "lucide-react"
import AuthButton from '@/components/AuthButton'
import CreateRepoModal from '@/components/CreateRepoModal'
import ContributionGraph from '@/components/ContributionGraph'
import { checkRepository, createRepository } from '@/lib/github'

export default function Home() {
  const { data: session, status, update } = useSession()
  const [hasRepo, setHasRepo] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && !session?.accessToken) {
      update()
    }
  }, [status, session?.accessToken, update])

  useEffect(() => {
    if (session?.accessToken && hasRepo === null) {
      checkRepository(session.accessToken)
        .then(exists => setHasRepo(exists))
        .catch(error => {
          console.error('Repository check failed:', error)
          setHasRepo(false)
        })
    }
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

  const LoadingState = () => (
    <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">로딩 중</CardTitle>
            <CardDescription>잠시만 기다려주세요...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  if (status === 'loading' || (status === 'authenticated' && !session?.accessToken)) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Github className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Github 잔디 심기</h1>
            </div>
            <AuthButton />
          </div>
          <LoadingState />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Github className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Github 잔디 심기</h1>
          </div>
          <AuthButton />
        </div>

        {session && session.accessToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ContributionGraph accessToken={session.accessToken} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {session && hasRepo === null && <LoadingState />}

        {session && hasRepo === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>저장소 생성 필요</AlertTitle>
              <AlertDescription>
                <p className="mb-4">일기를 저장할 lawn-diary 저장소가 필요합니다.</p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  저장소 생성하기
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {session && hasRepo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-8 hover:shadow-lg transition-all duration-300">
              <Link href="/diary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-emerald-500" />
                    <CardTitle>오늘의 일기 쓰기</CardTitle>
                  </div>
                  <Separator className="my-2" />
                  <CardDescription>
                    마크다운으로 일기를 작성하고 Github에 커밋하세요
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </motion.div>
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