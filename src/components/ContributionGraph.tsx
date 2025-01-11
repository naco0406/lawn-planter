import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BarChart3, Calendar } from "lucide-react";
import type {
    ContributionGraphProps,
    GitHubGraphQLResponse,
    ContributionCalendar,
    ContributionDay,
    ContributionWeek,
    GitHubAPIError
} from '../types/github';
import { Separator } from './ui/separator';

const ContributionGraph: React.FC<ContributionGraphProps> = ({ accessToken }) => {
    // 현재 날짜 정보를 동적으로 가져오기
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [viewType, setViewType] = useState<'year' | 'month'>('year');
    const [contributions, setContributions] = useState<ContributionCalendar | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 현재 날짜 정보 상수
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

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

    // 이후 기존 함수들 유지
    const isDateInYear = (date: string, year: string): boolean => {
        return date.startsWith(year);
    };

    const createEmptyYearGrid = (year: string): ContributionWeek[] => {
        const grid: ContributionWeek[] = [];
        const firstDate = new Date(`${year}-01-01`);
        const lastDate = new Date(`${year}-12-31`);

        const firstMonday = new Date(firstDate);
        while (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() - 1);
        }

        const lastSunday = new Date(lastDate);
        while (lastSunday.getDay() !== 0) {
            lastSunday.setDate(lastSunday.getDate() + 1);
        }

        let currentDate = new Date(firstMonday);

        while (currentDate <= lastSunday) {
            let currentWeek: ContributionDay[] = [];
            let hasValidDay = false;

            for (let i = 0; i < 7; i++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                if (isDateInYear(dateStr, year)) {
                    hasValidDay = true;
                }
                currentWeek.push({
                    contributionCount: 0,
                    date: dateStr,
                    isValid: isDateInYear(dateStr, year)
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (hasValidDay) {
                grid.push({ contributionDays: currentWeek });
            }
        }

        return grid;
    };

    const fillGridWithData = (emptyGrid: ContributionWeek[], year: string, month?: string): ContributionWeek[] => {
        if (!contributions) return emptyGrid;

        const filledGrid = JSON.parse(JSON.stringify(emptyGrid)) as ContributionWeek[];
        const dateMap = new Map<string, number>();

        contributions.weeks.forEach(week => {
            week.contributionDays.forEach(day => {
                dateMap.set(day.date, day.contributionCount);
            });
        });

        filledGrid.forEach(week => {
            week.contributionDays.forEach(day => {
                const dayDate = new Date(day.date);
                const dayYear = dayDate.getFullYear().toString();
                const dayMonth = (dayDate.getMonth() + 1).toString().padStart(2, '0');

                if (dayYear === year) {
                    if (!month || dayMonth === month) {
                        const count = dateMap.get(day.date);
                        if (count !== undefined) {
                            day.contributionCount = count;
                        }
                    }
                }
            });
        });

        return filledGrid;
    };

    const getContributionColor = (count: number): string => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
        if (count <= 3) return 'bg-emerald-200 dark:bg-emerald-900';
        if (count <= 6) return 'bg-emerald-300 dark:bg-emerald-700';
        if (count <= 9) return 'bg-emerald-400 dark:bg-emerald-600';
        return 'bg-emerald-500 dark:bg-emerald-500';
    };

    const formatDate = (dateString: string): string => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        }).format(new Date(dateString));
    };

    const getAvailableYears = (): string[] => {
        if (!contributions) return [currentYear];
        const years = new Set<string>();
        contributions.weeks.forEach(week => {
            week.contributionDays.forEach(day => {
                years.add(day.date.slice(0, 4));
            });
        });
        return Array.from(years).sort().reverse();
    };

    const getMonthsForYear = (year: string): string[] => {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            months.push(i.toString().padStart(2, '0'));
        }
        return months;
    };

    const MonthLabels = () => {
        const weekSize = 15; // 셀(12px) + 갭(3px)
        const months = [] as { label: string; position: number }[];
        let currentMonth = -1;

        filledGrid.forEach((week, weekIndex) => {
            week.contributionDays.forEach(day => {
                if (!day.isValid) return;

                const date = new Date(day.date);
                const month = date.getMonth();

                // 새로운 월의 시작을 감지
                if (month !== currentMonth) {
                    months.push({
                        label: `${month + 1}월`,
                        position: weekIndex * weekSize
                    });
                    currentMonth = month;
                }
            });
        });

        return (
            <div className="relative h-6">
                {months.map(({ label, position }) => (
                    <div
                        key={label}
                        className="absolute text-sm text-muted-foreground"
                        style={{
                            left: `${position}px`
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <Skeleton className="w-full h-64" />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    const emptyGrid = createEmptyYearGrid(selectedYear);
    const filledGrid = fillGridWithData(
        emptyGrid,
        selectedYear,
        viewType === 'month' ? selectedMonth : undefined
    );

    return (
        <Card className="w-full">
            <CardHeader className="space-y-6">
                {/* Title and Total Contributions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-emerald-500" />
                            GitHub Contributions
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            나의 GitHub 활동 기록을 확인해보세요
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                        <span className="text-lg font-medium">
                            {contributions?.totalContributions.toLocaleString()}
                            <span className="text-sm text-muted-foreground ml-1">contributions</span>
                        </span>
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <Tabs
                            defaultValue="year"
                            value={viewType}
                            onValueChange={(value) => {
                                setViewType(value as 'year' | 'month');
                                if (value === 'year') {
                                    setSelectedMonth('');
                                } else {
                                    // 월간 보기로 전환할 때
                                    if (selectedYear === currentYear) {
                                        // 현재 연도를 보고 있다면 현재 월을 선택
                                        setSelectedMonth(currentMonth);
                                    } else {
                                        // 다른 연도를 보고 있다면 1월을 선택
                                        setSelectedMonth('01');
                                    }
                                }
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="year" className="flex items-center gap-2">
                                    연간 보기
                                </TabsTrigger>
                                <TabsTrigger value="month" className="flex items-center gap-2">
                                    월간 보기
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-full sm:w-[130px]">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">연도</span>
                                    <SelectValue placeholder="Select year" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {getAvailableYears().map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}년
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {viewType === 'month' && (
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-full sm:w-[130px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">월</span>
                                        <SelectValue placeholder="Select month" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {getMonthsForYear(selectedYear).map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}월
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    <ScrollArea className="w-full rounded-lg">
                        <div className="min-w-[800px] mb-2">
                            <div className="pt-4 px-10">
                                <MonthLabels />
                            </div>
                            <div className="px-4">
                                <div className="flex">
                                    {/* Weekday labels */}
                                    <div className="flex flex-col gap-[3px] text-xs text-muted-foreground mr-2 sticky left-0 z-10 bg-card py-2 pr-2">
                                        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                                            <div key={day} className="h-3 flex items-center">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Contribution grid */}
                                    <div className="flex gap-[3px] overflow-x-auto py-2">
                                        {filledGrid.map((week, weekIndex) => (
                                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                                {week.contributionDays.map((day) => (
                                                    day.isValid ? (
                                                        <HoverCard key={day.date} openDelay={100} closeDelay={0}>
                                                            <HoverCardTrigger asChild>
                                                                <div
                                                                    className={`w-3 h-3 rounded-sm ${getContributionColor(
                                                                        day.contributionCount
                                                                    )} hover:ring-2 hover:ring-offset-1 hover:ring-ring transition-all cursor-pointer`}
                                                                />
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-auto p-4">
                                                                <div className="space-y-2">
                                                                    <p className="text-sm font-semibold">{formatDate(day.date)}</p>
                                                                    <p className="text-sm">
                                                                        {day.contributionCount}개의 contribution
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    ) : (
                                                        <div key={day.date} className="w-3 h-3" />
                                                    )
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Contribution level legend - 스크롤 영역 밖으로 이동 */}
                    <div className="flex items-center justify-end gap-2 px-4">
                        <span className="text-sm text-muted-foreground">기여도:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground mr-2">적음</span>
                            {[0, 3, 6, 9, 12].map((count) => (
                                <div
                                    key={count}
                                    className={`w-3 h-3 rounded-sm ${getContributionColor(count)}`}
                                />
                            ))}
                            <span className="text-xs text-muted-foreground ml-2">많음</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ContributionGraph;