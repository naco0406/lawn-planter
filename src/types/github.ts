// GitHub Contributions 관련 타입
export interface ContributionDay {
  contributionCount: number
  date: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface ContributionsCollection {
  contributionCalendar: ContributionCalendar
}

export interface GitHubUser {
  contributionsCollection: ContributionsCollection
}

export interface GitHubGraphQLResponse {
  user: GitHubUser
}

// Component Props 타입
export interface ContributionGraphProps {
  accessToken: string
}

// Repository 관련 타입
export interface RepositoryResponse {
  name: string
  description: string | null
  default_branch: string
}

export interface CreateRepoModalProps {
  isOpen: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

// API 응답 타입
export type GitHubAPIError = {
  message: string
  documentation_url?: string
}

// 유틸리티 함수 반환 타입
export type CheckRepositoryResult = Promise<boolean>
export type CreateRepositoryResult = Promise<void>
export type CommitFileResult = Promise<boolean>