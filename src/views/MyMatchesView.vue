<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Meine Duelle</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-plus" @click="$router.push('/create-match')" />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <!-- Filter Tabs -->
        <v-card class="mb-4" elevation="2">
          <v-tabs
            v-model="activeTab"
            color="primary"
            align-tabs="center"
          >
            <v-tab value="all">
              <v-icon class="mr-2">mdi-golf</v-icon>
              Alle ({{ allMatches.length }})
            </v-tab>
            <v-tab value="active">
              <v-icon class="mr-2">mdi-play</v-icon>
              Aktiv ({{ activeMatches.length }})
            </v-tab>
            <v-tab value="completed">
              <v-icon class="mr-2">mdi-check</v-icon>
              Beendet ({{ completedMatches.length }})
            </v-tab>
          </v-tabs>
        </v-card>

        <!-- Stats Overview -->
        <v-row class="mb-4">
          <v-col cols="6" md="3">
            <v-card class="text-center pa-4" elevation="1">
              <div class="text-h4 text-primary">{{ totalMatches }}</div>
              <div class="text-caption">Gesamt</div>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="text-center pa-4" elevation="1">
              <div class="text-h4 text-success">{{ totalWins }}</div>
              <div class="text-caption">Siege</div>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="text-center pa-4" elevation="1">
              <div class="text-h4 text-error">{{ totalLosses }}</div>
              <div class="text-caption">Niederlagen</div>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="text-center pa-4" elevation="1">
              <div class="text-h4" :class="winRateColorClass">{{ winRateText }}</div>
              <div class="text-caption">Siegrate</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Matches List -->
        <v-tabs-window v-model="activeTab">
          <!-- All Matches -->
          <v-tabs-window-item value="all">
            <div v-if="allMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-golf</v-icon>
              <div class="text-h6 mb-2">Noch keine Duelle</div>
              <div class="text-body-2 text-grey mb-4">
                Erstelle dein erstes Duell oder tritt einem bestehenden bei
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                @click="$router.push('/create-match')"
              >
                Neues Duell erstellen
              </v-btn>
            </div>
            
            <div v-else>
              <MatchCard
                v-for="match in sortedAllMatches"
                :key="match.id"
                :match="match"
                @enter-score="enterScore"
                @view-details="viewDetails"
                @delete-match="deleteMatch"
              />
            </div>
          </v-tabs-window-item>

          <!-- Active Matches -->
          <v-tabs-window-item value="active">
            <div v-if="activeMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clock-outline</v-icon>
              <div class="text-h6 mb-2">Keine aktiven Duelle</div>
              <div class="text-body-2 text-grey mb-4">
                Alle deine Duelle sind entweder beendet oder warten noch auf einen Gegner
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                @click="$router.push('/create-match')"
              >
                Neues Duell erstellen
              </v-btn>
            </div>
            
            <div v-else>
              <MatchCard
                v-for="match in sortedActiveMatches"
                :key="match.id"
                :match="match"
                @enter-score="enterScore"
                @view-details="viewDetails"
                @delete-match="deleteMatch"
              />
            </div>
          </v-tabs-window-item>

          <!-- Completed Matches -->
          <v-tabs-window-item value="completed">
            <div v-if="completedMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-trophy-outline</v-icon>
              <div class="text-h6 mb-2">Keine beendeten Duelle</div>
              <div class="text-body-2 text-grey mb-4">
                Beende dein erstes Duell, um es hier zu sehen
              </div>
            </div>
            
            <div v-else>
              <MatchCard
                v-for="match in sortedCompletedMatches"
                :key="match.id"
                :match="match"
                @enter-score="enterScore"
                @view-details="viewDetails"
                @delete-match="deleteMatch"
              />
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <!-- Floating Action Button -->
        <v-fab
          icon="mdi-plus"
          color="primary"
          location="bottom end"
          size="large"
          @click="$router.push('/create-match')"
        />
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
import { useUserStore, useMatchesStore } from '@/stores'
import MatchCard from '@/components/MatchCard.vue'
import type { Match } from '@/types'

// Stores
const userStore = useUserStore()
const matchesStore = useMatchesStore()
const router = useRouter()

// State
const activeTab = ref('all')
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const allMatches = computed(() => matchesStore.myMatches)
const activeMatches = computed(() => matchesStore.activeMatches.filter(m => 
  m.creatorId === userStore.currentUser?.id || m.opponentId === userStore.currentUser?.id
))
const completedMatches = computed(() => matchesStore.completedMatches.filter(m => 
  m.creatorId === userStore.currentUser?.id || m.opponentId === userStore.currentUser?.id
))

const sortedAllMatches = computed(() => {
  return [...allMatches.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const sortedActiveMatches = computed(() => {
  return [...activeMatches.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const sortedCompletedMatches = computed(() => {
  return [...completedMatches.value].sort((a, b) => {
    const aTime = a.completedAt?.getTime() || 0
    const bTime = b.completedAt?.getTime() || 0
    return bTime - aTime
  })
})

const totalMatches = computed(() => {
  return completedMatches.value.length
})

const totalWins = computed(() => {
  return completedMatches.value.filter(m => m.winnerId === userStore.currentUser?.id).length
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

// Methods
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

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

