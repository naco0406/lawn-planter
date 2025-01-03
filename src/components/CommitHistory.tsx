import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCommit, Clock, FileText, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Octokit } from '@octokit/rest';
import CommitPreviewModal from './CommitPreviewModal';

interface Commit {
    sha: string;
    commit: {
        message: string;
        author: {
            name?: string;
            email?: string;
            date?: string;
        } | null;
    };
    author: {
        login: string;
        avatar_url: string;
    } | null;
}

interface CommitHistoryProps {
    accessToken: string;
}

const CommitHistory = ({ accessToken }: CommitHistoryProps) => {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const octokit = new Octokit({ auth: accessToken });

                // Get authenticated user
                const { data: user } = await octokit.users.getAuthenticated();

                // Fetch commits
                const { data: commitsData } = await octokit.repos.listCommits({
                    owner: user.login,
                    repo: 'lawn-diary',
                    per_page: 10,
                });

                setCommits(commitsData);
                setLoading(false);
            } catch (err) {
                setError('커밋 히스토리를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchCommits();
    }, [accessToken]);

    if (error) {
        return (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <GitCommit className="h-5 w-5" />
                        오류 발생
                    </CardTitle>
                </CardHeader>
                <CardContent>{error}</CardContent>
            </Card>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitCommit className="h-5 w-5 text-emerald-500" />
                        최근 커밋 히스토리
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                        >
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                commits.map((commit) => (
                                    <motion.div
                                        key={commit.sha}
                                        variants={item}
                                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() => setSelectedCommit(commit.sha)}
                                    >
                                        <div className="bg-emerald-500/10 p-2 rounded-full">
                                            <FileText className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium break-all">
                                                {commit.commit.message}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {commit.commit.author?.date && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays className="h-4 w-4" />
                                                            {format(new Date(commit.commit.author.date), 'yyyy-MM-dd')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {format(new Date(commit.commit.author.date), 'HH:mm')}
                                                        </span>
                                                    </>
                                                )}
                                                {commit.author && (
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={commit.author.avatar_url}
                                                            alt={commit.author.login}
                                                            className="w-5 h-5 rounded-full"
                                                        />
                                                        <span>{commit.author.login}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <CommitPreviewModal
                isOpen={!!selectedCommit}
                onClose={() => setSelectedCommit(null)}
                accessToken={accessToken}
                sha={selectedCommit || ''}
            />
        </>
    );
};

export default CommitHistory;