import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Match, PlayerScore, Score, HoleCount } from '@/types'
import { useUserStore } from './user'
import { useFriendsStore } from './friends'

export const useMatchesStore = defineStore('matches', () => {
  // State
  const matches = ref<Match[]>([])
  const currentMatch = ref<Match | null>(null)

  // Getters
  const allMatches = computed(() => matches.value)
  const activeMatches = computed(() => matches.value.filter(m => m.status !== 'completed'))
  const completedMatches = computed(() => matches.value.filter(m => m.status === 'completed'))
  
  const myMatches = computed(() => {
    const userStore = useUserStore()
    if (!userStore.currentUser) return []
    
    return matches.value.filter(m => 
      m.creatorId === userStore.currentUser!.id || 
      m.opponentId === userStore.currentUser!.id
    )
  })

  // Actions
  function generateMatchCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  function createMatch(holes: HoleCount): Match {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      throw new Error('User must be logged in to create a match')
    }

    const match: Match = {
      id: 'match_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      code: generateMatchCode(),
      creatorId: userStore.currentUser.id,
      creatorNickname: userStore.currentUser.nickname,
      holes,
      status: 'waiting',
      createdAt: new Date(),
      playerScores: []
    }

    matches.value.push(match)
    currentMatch.value = match
    saveMatchesToStorage()
    return match
  }

  function joinMatch(code: string): Match {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      throw new Error('User must be logged in to join a match')
    }

    const match = matches.value.find(m => m.code === code && m.status === 'waiting')
    if (!match) {
      throw new Error('Match not found or already started')
    }

    if (match.creatorId === userStore.currentUser.id) {
      throw new Error('Cannot join your own match')
    }

    match.opponentId = userStore.currentUser.id
    match.opponentNickname = userStore.currentUser.nickname
    match.status = 'in_progress'
    
    currentMatch.value = match
    saveMatchesToStorage()
    return match
  }

  function submitScore(matchId: string, scores: Score[]): void {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      throw new Error('User must be logged in to submit scores')
    }

    const match = matches.value.find(m => m.id === matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    const totalStrokes = scores.reduce((sum, score) => sum + score.strokes, 0)
    
    const playerScore: PlayerScore = {
      playerId: userStore.currentUser.id,
      playerNickname: userStore.currentUser.nickname,
      scores,
      totalStrokes,
      isComplete: true
    }

    // Remove existing score for this player if any
    match.playerScores = match.playerScores.filter(ps => ps.playerId !== userStore.currentUser!.id)
    match.playerScores.push(playerScore)

    // Check if match is complete
    if (match.playerScores.length === 2 && match.playerScores.every(ps => ps.isComplete)) {
      completeMatch(match)
    }

    saveMatchesToStorage()
  }

  function completeMatch(match: Match): void {
    if (match.playerScores.length !== 2) return

    const [player1, player2] = match.playerScores
    const winner = player1.totalStrokes < player2.totalStrokes ? player1 : 
                   player2.totalStrokes < player1.totalStrokes ? player2 : null

    if (winner) {
      match.winnerId = winner.playerId
      match.winnerNickname = winner.playerNickname
    }

    match.status = 'completed'
    match.completedAt = new Date()

    // Update friend stats
    const friendsStore = useFriendsStore()
    const userStore = useUserStore()
    
    if (userStore.currentUser) {
      const opponentScore = match.playerScores.find(ps => ps.playerId !== userStore.currentUser!.id)
      if (opponentScore) {
        let friend = friendsStore.getFriendByNickname(opponentScore.playerNickname)
        if (!friend) {
          friend = friendsStore.addFriend(opponentScore.playerNickname)
        }
        
        const userWon = winner?.playerId === userStore.currentUser.id
        friendsStore.updateFriendStats(friend.id, !userWon) // Friend wins if user doesn't win
      }
    }

    saveMatchesToStorage()
  }

  function getMatchByCode(code: string): Match | undefined {
    return matches.value.find(m => m.code === code)
  }

  function getMatchById(id: string): Match | undefined {
    return matches.value.find(m => m.id === id)
  }

  function deleteMatch(matchId: string): void {
    const index = matches.value.findIndex(m => m.id === matchId)
    if (index !== -1) {
      matches.value.splice(index, 1)
      if (currentMatch.value?.id === matchId) {
        currentMatch.value = null
      }
      saveMatchesToStorage()
    }
  }

  function setCurrentMatch(match: Match | null): void {
    currentMatch.value = match
  }

  function saveMatchesToStorage(): void {
    const matchesData = matches.value.map(match => ({
      ...match,
      createdAt: match.createdAt.toISOString(),
      completedAt: match.completedAt?.toISOString()
    }))
    localStorage.setItem('golfduell_matches', JSON.stringify(matchesData))
  }

  function loadMatchesFromStorage(): void {
    try {
      const stored = localStorage.getItem('golfduell_matches')
      if (stored) {
        const parsed = JSON.parse(stored)
        matches.value = parsed.map((match: any) => ({
          ...match,
          createdAt: new Date(match.createdAt),
          completedAt: match.completedAt ? new Date(match.completedAt) : undefined
        }))
      }
    } catch (error) {
      console.error('Error loading matches from storage:', error)
      matches.value = []
    }
  }

  function clearAllMatches(): void {
    matches.value = []
    currentMatch.value = null
    localStorage.removeItem('golfduell_matches')
  }

  return {
    // State
    matches,
    currentMatch,
    
    // Getters
    allMatches,
    activeMatches,
    completedMatches,
    myMatches,
    
    // Actions
    createMatch,
    joinMatch,
    submitScore,
    getMatchByCode,
    getMatchById,
    deleteMatch,
    setCurrentMatch,
    loadMatchesFromStorage,
    clearAllMatches
  }
})

