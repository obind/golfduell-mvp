// User types
export interface User {
  id: string
  nickname: string
  createdAt: Date
}

// Friend types
export interface Friend {
  id: string
  nickname: string
  wins: number
  losses: number
  totalMatches: number
  addedAt: Date
}

// Match types
export interface Score {
  hole: number
  strokes: number
}

export interface PlayerScore {
  playerId: string
  playerNickname: string
  scores: Score[]
  totalStrokes: number
  isComplete: boolean
}

export interface Match {
  id: string
  code: string
  creatorId: string
  creatorNickname: string
  opponentId?: string
  opponentNickname?: string
  holes: number // 9 or 18
  status: 'waiting' | 'in_progress' | 'completed'
  createdAt: Date
  completedAt?: Date
  playerScores: PlayerScore[]
  winnerId?: string
  winnerNickname?: string
}

// UI types
export interface NavigationItem {
  title: string
  icon: string
  route: string
}

// Utility types
export type MatchStatus = 'waiting' | 'in_progress' | 'completed'
export type HoleCount = 9 | 18

