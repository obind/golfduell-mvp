import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userNickname = computed(() => currentUser.value?.nickname || '')

  // Actions
  function generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  function generateRandomNickname(): string {
    const adjectives = ['Swift', 'Eagle', 'Pro', 'Ace', 'Master', 'Champion', 'Star', 'Elite', 'Golden', 'Silver']
    const nouns = ['Golfer', 'Player', 'Putter', 'Driver', 'Birdie', 'Eagle', 'Albatross', 'Tiger', 'Shark', 'Bear']
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 999) + 1
    
    return `${adjective}${noun}${number}`
  }

  function createUser(nickname?: string): User {
    const user: User = {
      id: generateUserId(),
      nickname: nickname || generateRandomNickname(),
      createdAt: new Date()
    }
    
    currentUser.value = user
    saveUserToStorage(user)
    return user
  }

  function updateNickname(newNickname: string): void {
    if (currentUser.value) {
      currentUser.value.nickname = newNickname
      saveUserToStorage(currentUser.value)
    }
  }

  function saveUserToStorage(user: User): void {
    localStorage.setItem('golfduell_user', JSON.stringify({
      ...user,
      createdAt: user.createdAt.toISOString()
    }))
  }

  function loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('golfduell_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt)
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    }
    return null
  }

  function initializeUser(): void {
    if (isInitialized.value) return
    
    const storedUser = loadUserFromStorage()
    if (storedUser) {
      currentUser.value = storedUser
    } else {
      createUser()
    }
    
    isInitialized.value = true
  }

  function logout(): void {
    currentUser.value = null
    localStorage.removeItem('golfduell_user')
    isInitialized.value = false
  }

  return {
    // State
    currentUser,
    isInitialized,
    
    // Getters
    isLoggedIn,
    userNickname,
    
    // Actions
    createUser,
    updateNickname,
    initializeUser,
    logout
  }
})

