import React, { FC, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Octokit } from '@octokit/rest';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  sha: string;
  fileName?: string;
}

export const CommitPreviewModal: FC<Props> = ({
  isOpen,
  onClose,
  accessToken,
  sha,
  fileName
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommitContent = async () => {
      if (!isOpen || !sha) return;

      setLoading(true);
      setError(null);

      try {
        const octokit = new Octokit({ auth: accessToken });

        // Get authenticated user
        const { data: user } = await octokit.users.getAuthenticated();

        // Get commit details to find the file
        const { data: commitData } = await octokit.repos.getCommit({
          owner: user.login,
          repo: 'lawn-diary',
          ref: sha,
        });

        // Find the markdown file in the commit
        const mdFile = commitData.files?.find(file => file.filename.endsWith('.md'));

        if (!mdFile) {
          setError('이 커밋에서 마크다운 파일을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        // Get the raw content
        const { data: fileData } = await octokit.repos.getContent({
          owner: user.login,
          repo: 'lawn-diary',
          path: mdFile.filename,
          ref: sha,
        });

        if ('content' in fileData) {
          // Base64 디코딩 (한글 지원)
          const base64 = fileData.content.replace(/\n/g, '');
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const decoder = new TextDecoder('utf-8');
          const decodedContent = decoder.decode(bytes);
          setContent(decodedContent);
        }

        setLoading(false);
      } catch (err) {
        setError('파일 내용을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchCommitContent();
  }, [isOpen, sha, accessToken]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {fileName || '커밋 미리보기'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full relative">
            {loading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="prose prose-stone dark:prose-invert max-w-none p-4">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
