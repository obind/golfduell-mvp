// Export all stores
export { useUserStore } from './user'
export { useFriendsStore } from './friends'
export { useMatchesStore } from './matches'

// Initialize all stores
export function initializeStores() {
  const userStore = useUserStore()
  const friendsStore = useFriendsStore()
  const matchesStore = useMatchesStore()
  
  // Initialize user first
  userStore.initializeUser()
  
  // Then load friends and matches
  friendsStore.loadFriendsFromStorage()
  matchesStore.loadMatchesFromStorage()
}

