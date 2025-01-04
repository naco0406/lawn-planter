'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateRepoModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function CreateRepoModal({ 
  isOpen, 
  onOpenChange,
  onConfirm 
}: CreateRepoModalProps) {
  const [repoName, setRepoName] = useState('lawn-diary')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">저장소 생성</DialogTitle>
          <DialogDescription className="text-gray-600">
            마크다운 형식의 일기를 저장하고 잔디를 심는 데 사용되는 저장소를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="repoName">저장소 이름</Label>
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="lawn-diary"
              className="w-full"
              disabled
              readOnly
            />
          </div>

          <Alert variant="default" className="bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              생성된 저장소는 GitHub에서 공개적으로 접근 가능합니다.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!repoName.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? '생성 중...' : '생성하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}