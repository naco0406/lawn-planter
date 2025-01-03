'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Github, BookOpenCheck, AlertCircle, Loader2, Sprout } from "lucide-react"
import AuthButton from '@/components/AuthButton'
import CreateRepoModal from '@/components/CreateRepoModal'
import ContributionGraph from '@/components/ContributionGraph'
import CommitHistory from '@/components/CommitHistory'
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
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full mb-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              로딩 중
            </CardTitle>
            <CardDescription>잠시만 기다려주세요...</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
              <p className="text-muted-foreground">데이터를 불러오는 중입니다</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const WelcomeState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
            <Sprout className="h-8 w-8 text-emerald-500" />
            Github 잔디 심기
            <Sprout className="h-8 w-8 text-emerald-500" />
          </CardTitle>
          <CardDescription className="text-xl">
            매일 일기를 쓰고 깃허브 잔디를 가꿔보세요 🌱
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span> 마크다운 일기
                </CardTitle>
                <CardDescription>
                  마크다운 형식으로 자유롭게 일기를 작성하세요
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🌿</span> 잔디 관리
                </CardTitle>
                <CardDescription>
                  매일매일 커밋하며 잔디를 가꾸어보세요
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span> 기록 관리
                </CardTitle>
                <CardDescription>
                  작성한 일기들을 깔끔하게 관리해보세요
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          {/* <div className="flex justify-center pt-4">
            <AuthButton />
          </div> */}
        </CardContent>
      </Card>
    </motion.div>
  )

  const Header = () => (
    <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Github className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Github 잔디 심기</h1>
      </div>
      {status !== 'loading' && <AuthButton />}
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <Header />

      {status === 'loading' || (status === 'authenticated' && !session?.accessToken) ? (
        <LoadingState />
      ) : !session ? (
        <WelcomeState />
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">
          {session.accessToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <ContributionGraph accessToken={session.accessToken} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {hasRepo === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>저장소 생성 필요</AlertTitle>
                <AlertDescription>
                  <p className="mb-4">일기를 저장할 lawn-diary 저장소가 필요합니다 🌱</p>
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

          {hasRepo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <Link href="/diary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-5 w-5 text-emerald-500" />
                      <CardTitle>
                        <div className="mb-2">오늘의 일기 쓰기 🌱</div>
                      </CardTitle>
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

          {session.accessToken && hasRepo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CommitHistory accessToken={session.accessToken} />
            </motion.div>
          )}
        </div>
      )}

      <CreateRepoModal
        isOpen={showModal}
        onConfirm={handleCreateRepo}
        onCancel={() => setShowModal(false)}
      />
    </main>
  )
}