import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import type {
    ContributionGraphProps,
    GitHubGraphQLResponse,
    ContributionCalendar,
    GitHubAPIError
} from '../types/github';

const ContributionGraph: React.FC<ContributionGraphProps> = ({ accessToken }) => {
    const [contributions, setContributions] = useState<ContributionCalendar | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContributions = async () => {
            if (!accessToken) return;

            try {
                const octokit = new Octokit({ auth: accessToken });
                const user = await octokit.users.getAuthenticated();
                const username = user.data.login;

                const query = `
          query ($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `;

                const response = await octokit.graphql<GitHubGraphQLResponse>(query, { username });
                const calendar = response.user.contributionsCollection.contributionCalendar;
                setContributions(calendar);
                setLoading(false);
            } catch (err) {
                const error = err as GitHubAPIError;
                setError(error.message);
                setLoading(false);
            }
        };

        fetchContributions();
    }, [accessToken]);

    const getContributionColor = (count: number): string => {
        if (count === 0) return 'bg-gray-100';
        if (count <= 3) return 'bg-green-200';
        if (count <= 6) return 'bg-green-300';
        if (count <= 9) return 'bg-green-400';
        return 'bg-green-500';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded">
                데이터를 불러오는데 실패했습니다: {error}
            </div>
        );
    }

    if (!contributions) {
        return null;
    }

    // 요일 레이블 배열
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">GitHub Contributions</h2>
                <span className="text-sm text-gray-600">
                    총 {contributions.totalContributions}개의 contribution
                </span>
            </div>

            <div className="flex gap-4">
                {/* 요일 레이블 */}
                <div className="flex flex-col gap-1 pt-6 text-xs text-gray-500">
                    {weekDays.map((day) => (
                        <div key={day} className="h-3 flex items-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 컨트리뷰션 그리드 */}
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-1">
                        {contributions.weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.contributionDays.map((day) => (
                                    <div
                                        key={day.date}
                                        className={`w-3 h-3 rounded-sm ${getContributionColor(
                                            day.contributionCount
                                        )} hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 transition-all`}
                                        title={`${formatDate(day.date)}: ${day.contributionCount}개의 contribution`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* 월 레이블 */}
                    <div className="flex gap-1 mt-1">
                        {contributions.weeks.map((week, index) => {
                            const date = new Date(week.contributionDays[0].date);
                            // 매월 1일이 있는 주에만 월 표시
                            const showMonth = date.getDate() <= 7;
                            return (
                                <div key={index} className="w-3">
                                    {showMonth && (
                                        <div className="text-xs text-gray-500 -rotate-60 origin-left translate-y-2">
                                            {new Intl.DateTimeFormat('ko-KR', { month: 'short' }).format(date)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 범례 */}
                <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-gray-500">적음</span>
                    {[0, 3, 6, 9, 12].map((count) => (
                        <div
                            key={count}
                            className={`w-3 h-3 rounded-sm ${getContributionColor(count)}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500">많음</span>
                </div>
            </div>
        </div>
    );
};

export default ContributionGraph;