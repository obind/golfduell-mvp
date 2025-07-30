<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-golf</v-icon>
        GolfDuell
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-account-circle" @click="showUserInfo = true" />
    </v-app-bar>

    <!-- Navigation Drawer -->
    <AppNavigation v-model="drawer" />

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <!-- Welcome Section -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="text-center pa-6" color="primary" dark elevation="4">
              <v-card-title class="text-h4 mb-2">
                <v-icon size="large" class="mr-3">mdi-golf</v-icon>
                Willkommen, {{ userStore.userNickname }}!
              </v-card-title>
              <v-card-subtitle class="text-h6">
                Bereit für dein nächstes Golf-Duell?
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card
              class="text-center pa-4 h-100"
              elevation="2"
              hover
              @click="$router.push('/create-match')"
            >
              <v-icon size="64" color="success" class="mb-3">mdi-plus-circle</v-icon>
              <v-card-title>Neues Duell</v-card-title>
              <v-card-text>
                Starte ein neues Golf-Duell und fordere deine Freunde heraus
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card
              class="text-center pa-4 h-100"
              elevation="2"
              hover
              @click="$router.push('/join-match')"
            >
              <v-icon size="64" color="info" class="mb-3">mdi-account-plus</v-icon>
              <v-card-title>Duell beitreten</v-card-title>
              <v-card-text>
                Tritt einem bestehenden Duell bei und zeige dein Können
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Stats Overview -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Deine Statistiken
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-primary">{{ totalMatches }}</div>
                      <div class="text-caption">Gesamt Spiele</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-success">{{ totalWins }}</div>
                      <div class="text-caption">Siege</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4 text-error">{{ totalLosses }}</div>
                      <div class="text-caption">Niederlagen</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-h4" :class="winRateColorClass">{{ winRateText }}</div>
                      <div class="text-caption">Siegrate</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Matches -->
        <v-row v-if="recentMatches.length > 0">
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-history</v-icon>
                  Letzte Duelle
                </div>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="$router.push('/my-matches')"
                >
                  Alle anzeigen
                </v-btn>
              </v-card-title>
              <v-card-text>
                <MatchCard
                  v-for="match in recentMatches"
                  :key="match.id"
                  :match="match"
                  @enter-score="enterScore"
                  @view-details="viewDetails"
                  @delete-match="deleteMatch"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Friends Section -->
        <v-row v-if="friendsStore.friendsCount > 0">
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-account-group</v-icon>
                  Deine Freunde ({{ friendsStore.friendsCount }})
                </div>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="$router.push('/friends')"
                >
                  Alle anzeigen
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="friend in topFriends"
                    :key="friend.id"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <FriendCard
                      :friend="friend"
                      @challenge="challengeFriend"
                      @remove="removeFriend"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-row v-if="totalMatches === 0">
          <v-col cols="12">
            <v-card class="text-center pa-8" elevation="2">
              <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-golf</v-icon>
              <v-card-title class="text-h5 mb-2">Noch keine Duelle gespielt</v-card-title>
              <v-card-text class="text-body-1 mb-4">
                Starte dein erstes Golf-Duell und fordere deine Freunde heraus!
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
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- User Info Dialog -->
    <v-dialog v-model="showUserInfo" max-width="400">
      <v-card>
        <v-card-title>Benutzer Info</v-card-title>
        <v-card-text>
          <div class="text-center mb-4">
            <v-avatar size="80" color="primary">
              <v-icon size="40" color="white">mdi-account</v-icon>
            </v-avatar>
          </div>
          <div class="text-center">
            <div class="text-h6">{{ userStore.userNickname }}</div>
            <div class="text-caption text-grey">
              Mitglied seit {{ formatDate(userStore.currentUser?.createdAt) }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUserInfo = false">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useFriendsStore, useMatchesStore, initializeStores } from '@/stores'
import AppNavigation from '@/components/AppNavigation.vue'
import MatchCard from '@/components/MatchCard.vue'
import FriendCard from '@/components/FriendCard.vue'
import type { Match, Friend } from '@/types'

// Stores
const userStore = useUserStore()
const friendsStore = useFriendsStore()
const matchesStore = useMatchesStore()
const router = useRouter()

// State
const drawer = ref(false)
const showUserInfo = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const totalMatches = computed(() => {
  return matchesStore.myMatches.filter(m => m.status === 'completed').length
})

const totalWins = computed(() => {
  return matchesStore.myMatches.filter(m => 
    m.status === 'completed' && m.winnerId === userStore.currentUser?.id
  ).length
})

const totalLosses = computed(() => {
  return totalMatches.value - totalWins.value
})

const winRate = computed(() => {
  if (totalMatches.value === 0) return 0
  return (totalWins.value / totalMatches.value) * 100
})

const winRateText = computed(() => {
  return `${Math.round(winRate.value)}%`
})

const winRateColorClass = computed(() => {
  const rate = winRate.value
  if (rate >= 70) return 'text-success'
  if (rate >= 50) return 'text-warning'
  return 'text-error'
})

const recentMatches = computed(() => {
  return matchesStore.myMatches
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
})

const topFriends = computed(() => {
  return friendsStore.friendsList.slice(0, 3)
})

// Methods
function formatDate(date?: Date): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function enterScore(match: Match) {
  matchesStore.setCurrentMatch(match)
  router.push(`/match/${match.id}/score`)
}

function viewDetails(match: Match) {
  router.push(`/match/${match.id}`)
}

function deleteMatch(match: Match) {
  matchesStore.deleteMatch(match.id)
  showSnackbar('Duell gelöscht', 'success')
}

function challengeFriend(friend: Friend) {
  router.push('/create-match')
}

function removeFriend(friend: Friend) {
  friendsStore.removeFriend(friend.id)
  showSnackbar('Freund entfernt', 'success')
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}

// Lifecycle
onMounted(() => {
  initializeStores()
})
</script>

