import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Friend } from '@/types'

export const useFriendsStore = defineStore('friends', () => {
  // State
  const friends = ref<Friend[]>([])

  // Getters
  const friendsList = computed(() => friends.value)
  const friendsCount = computed(() => friends.value.length)
  
  const leaderboard = computed(() => {
    return [...friends.value]
      .filter(friend => friend.totalMatches > 0)
      .sort((a, b) => {
        const aWinRate = a.totalMatches > 0 ? a.wins / a.totalMatches : 0
        const bWinRate = b.totalMatches > 0 ? b.wins / b.totalMatches : 0
        
        if (aWinRate !== bWinRate) {
          return bWinRate - aWinRate // Higher win rate first
        }
        
        return b.wins - a.wins // More wins first if same win rate
      })
  })

  // Actions
  function addFriend(nickname: string): Friend {
    const existingFriend = friends.value.find(f => f.nickname === nickname)
    if (existingFriend) {
      throw new Error('Friend with this nickname already exists')
    }

    const friend: Friend = {
      id: 'friend_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
      nickname,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      addedAt: new Date()
    }

    friends.value.push(friend)
    saveFriendsToStorage()
    return friend
  }

  function removeFriend(friendId: string): void {
    const index = friends.value.findIndex(f => f.id === friendId)
    if (index !== -1) {
      friends.value.splice(index, 1)
      saveFriendsToStorage()
    }
  }

  function updateFriendStats(friendId: string, won: boolean): void {
    const friend = friends.value.find(f => f.id === friendId)
    if (friend) {
      friend.totalMatches++
      if (won) {
        friend.wins++
      } else {
        friend.losses++
      }
      saveFriendsToStorage()
    }
  }

  function getFriendByNickname(nickname: string): Friend | undefined {
    return friends.value.find(f => f.nickname === nickname)
  }

  function getFriendById(id: string): Friend | undefined {
    return friends.value.find(f => f.id === id)
  }

  function saveFriendsToStorage(): void {
    const friendsData = friends.value.map(friend => ({
      ...friend,
      addedAt: friend.addedAt.toISOString()
    }))
    localStorage.setItem('golfduell_friends', JSON.stringify(friendsData))
  }

  function loadFriendsFromStorage(): void {
    try {
      const stored = localStorage.getItem('golfduell_friends')
      if (stored) {
        const parsed = JSON.parse(stored)
        friends.value = parsed.map((friend: any) => ({
          ...friend,
          addedAt: new Date(friend.addedAt)
        }))
      }
    } catch (error) {
      console.error('Error loading friends from storage:', error)
      friends.value = []
    }
  }

  function clearAllFriends(): void {
    friends.value = []
    localStorage.removeItem('golfduell_friends')
  }

  return {
    // State
    friends,
    
    // Getters
    friendsList,
    friendsCount,
    leaderboard,
    
    // Actions
    addFriend,
    removeFriend,
    updateFriendStats,
    getFriendByNickname,
    getFriendById,
    loadFriendsFromStorage,
    clearAllFriends
  }
})

