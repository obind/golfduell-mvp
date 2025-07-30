<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Leaderboard</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-refresh" @click="refreshData" />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <!-- Header Card -->
        <v-card class="mb-4" elevation="4" color="primary" dark>
          <v-card-text class="text-center pa-6">
            <v-icon size="64" class="mb-3">mdi-trophy</v-icon>
            <div class="text-h4 mb-2">Leaderboard</div>
            <div class="text-subtitle-1">
              Wer ist der beste Golfer unter deinen Freunden?
            </div>
          </v-card-text>
        </v-card>

        <!-- Filter Options -->
        <v-card class="mb-4" elevation="1">
          <v-card-text class="pb-2">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-select
                  v-model="sortCriteria"
                  :items="sortOptions"
                  label="Sortieren nach"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="minGames"
                  label="Mindestanzahl Spiele"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Leaderboard -->
        <div v-if="filteredLeaderboard.length === 0">
          <!-- Empty State -->
          <v-card class="text-center pa-8" elevation="2">
            <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-trophy-outline</v-icon>
            <v-card-title class="text-h5 mb-2">Noch keine Rangliste</v-card-title>
            <v-card-text class="text-body-1 mb-4">
              Spiele Duelle mit deinen Freunden, um eine Rangliste zu erstellen
            </v-card-text>
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              @click="$router.push('/create-match')"
            >
              Erstes Duell starten
            </v-btn>
          </v-card>
        </div>

        <div v-else>
          <!-- Top 3 Podium -->
          <v-card v-if="topThree.length > 0" class="mb-4" elevation="3">
            <v-card-title class="text-center">
              <v-icon class="mr-2">mdi-podium-gold</v-icon>
              Top 3
            </v-card-title>
            <v-card-text>
              <v-row justify="center" align="end" class="podium-container">
                <!-- 2nd Place -->
                <v-col
                  v-if="topThree[1]"
                  cols="4"
                  class="text-center podium-item second-place"
                >
                  <div class="podium-rank">
                    <v-avatar size="60" color="grey-lighten-1">
                      <v-icon size="30" color="white">mdi-medal</v-icon>
                    </v-avatar>
                    <div class="text-h6 mt-2">{{ topThree[1].nickname }}</div>
                    <div class="text-caption text-grey">{{ getWinRateText(topThree[1]) }}</div>
                  </div>
                  <div class="podium-base second" />
                </v-col>

                <!-- 1st Place -->
                <v-col
                  v-if="topThree[0]"
                  cols="4"
                  class="text-center podium-item first-place"
                >
                  <div class="podium-rank">
                    <v-avatar size="80" color="warning">
                      <v-icon size="40" color="white">mdi-trophy</v-icon>
                    </v-avatar>
                    <div class="text-h5 mt-2 font-weight-bold">{{ topThree[0].nickname }}</div>
                    <div class="text-caption text-grey">{{ getWinRateText(topThree[0]) }}</div>
                    <v-chip color="warning" size="small" class="mt-1">Champion</v-chip>
                  </div>
                  <div class="podium-base first" />
                </v-col>

                <!-- 3rd Place -->
                <v-col
                  v-if="topThree[2]"
                  cols="4"
                  class="text-center podium-item third-place"
                >
                  <div class="podium-rank">
                    <v-avatar size="50" color="deep-orange-lighten-1">
                      <v-icon size="25" color="white">mdi-medal-outline</v-icon>
                    </v-avatar>
                    <div class="text-h6 mt-2">{{ topThree[2].nickname }}</div>
                    <div class="text-caption text-grey">{{ getWinRateText(topThree[2]) }}</div>
                  </div>
                  <div class="podium-base third" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Full Leaderboard -->
          <v-card elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-format-list-numbered</v-icon>
              Vollständige Rangliste
              <v-spacer />
              <v-chip size="small" variant="outlined">
                {{ filteredLeaderboard.length }} Spieler
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <LeaderboardCard
                v-for="(friend, index) in filteredLeaderboard"
                :key="friend.id"
                :friend="friend"
                :rank="index + 1"
              />
            </v-card-text>
          </v-card>
        </div>

        <!-- Stats Summary -->
        <v-card v-if="filteredLeaderboard.length > 0" class="mt-4" elevation="1">
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            Statistiken
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 text-primary">{{ totalPlayers }}</div>
                  <div class="text-caption">Aktive Spieler</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 text-success">{{ totalGames }}</div>
                  <div class="text-caption">Gesamt Spiele</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 text-info">{{ averageWinRate }}%</div>
                  <div class="text-caption">Ø Siegrate</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 text-warning">{{ mostActivePlayer?.nickname || '-' }}</div>
                  <div class="text-caption">Aktivster Spieler</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFriendsStore } from '@/stores'
import LeaderboardCard from '@/components/LeaderboardCard.vue'
import type { Friend } from '@/types'

// Stores
const friendsStore = useFriendsStore()
const router = useRouter()

// State
const sortCriteria = ref('winrate')
const minGames = ref(1)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const sortOptions = [
  { title: 'Siegrate', value: 'winrate' },
  { title: 'Siege', value: 'wins' },
  { title: 'Spiele gespielt', value: 'games' },
  { title: 'Name', value: 'name' }
]

const filteredLeaderboard = computed(() => {
  let friends = friendsStore.friendsList.filter(friend => 
    friend.totalMatches >= minGames.value
  )
  
  friends.sort((a, b) => {
    switch (sortCriteria.value) {
      case 'winrate':
        const aRate = a.totalMatches > 0 ? a.wins / a.totalMatches : 0
        const bRate = b.totalMatches > 0 ? b.wins / b.totalMatches : 0
        if (aRate !== bRate) return bRate - aRate
        return b.wins - a.wins // Tiebreaker: more wins
      case 'wins':
        return b.wins - a.wins
      case 'games':
        return b.totalMatches - a.totalMatches
      case 'name':
        return a.nickname.localeCompare(b.nickname)
      default:
        return 0
    }
  })
  
  return friends
})

const topThree = computed(() => {
  return filteredLeaderboard.value.slice(0, 3)
})

const totalPlayers = computed(() => {
  return filteredLeaderboard.value.length
})

const totalGames = computed(() => {
  return filteredLeaderboard.value.reduce((sum, friend) => sum + friend.totalMatches, 0)
})

const averageWinRate = computed(() => {
  if (filteredLeaderboard.value.length === 0) return 0
  
  const totalWinRate = filteredLeaderboard.value.reduce((sum, friend) => {
    const winRate = friend.totalMatches > 0 ? (friend.wins / friend.totalMatches) * 100 : 0
    return sum + winRate
  }, 0)
  
  return Math.round(totalWinRate / filteredLeaderboard.value.length)
})

const mostActivePlayer = computed(() => {
  return filteredLeaderboard.value
    .sort((a, b) => b.totalMatches - a.totalMatches)[0]
})

// Methods
function getWinRateText(friend: Friend): string {
  if (friend.totalMatches === 0) return '0%'
  const rate = (friend.wins / friend.totalMatches) * 100
  return `${Math.round(rate)}% (${friend.wins}/${friend.totalMatches})`
}

function refreshData() {
  friendsStore.loadFriendsFromStorage()
  showSnackbar('Daten aktualisiert', 'success')
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

<style scoped>
.podium-container {
  position: relative;
  min-height: 200px;
}

.podium-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-rank {
  z-index: 2;
  position: relative;
}

.podium-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  border-radius: 8px 8px 0 0;
}

.podium-base.first {
  height: 80px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.podium-base.second {
  height: 60px;
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
}

.podium-base.third {
  height: 40px;
  background: linear-gradient(135deg, #CD7F32, #B8860B);
}

.first-place .podium-rank {
  margin-bottom: 80px;
}

.second-place .podium-rank {
  margin-bottom: 60px;
}

.third-place .podium-rank {
  margin-bottom: 40px;
}
</style>

