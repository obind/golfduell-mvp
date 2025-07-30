<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Duell Details</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="canEnterScore"
        icon="mdi-golf"
        @click="enterScore"
      />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6" v-if="match">
        <!-- Match Header -->
        <v-card class="mb-4" elevation="4">
          <v-card-title class="d-flex align-center">
            <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
            <span>{{ match.holes }} Löcher Duell</span>
            <v-spacer />
            <v-chip :color="statusColor" variant="elevated">
              {{ statusText }}
            </v-chip>
          </v-card-title>

          <v-card-subtitle>
            Code: <strong>{{ match.code }}</strong>
          </v-card-subtitle>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-caption text-grey mb-1">Erstellt</div>
                <div>{{ formatDate(match.createdAt) }}</div>
              </v-col>
              <v-col cols="12" md="6" v-if="match.completedAt">
                <div class="text-caption text-grey mb-1">Beendet</div>
                <div>{{ formatDate(match.completedAt) }}</div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions v-if="canEnterScore">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-golf"
              @click="enterScore"
            >
              Score eingeben
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Players -->
        <v-row class="mb-4">
          <!-- Creator -->
          <v-col cols="12" md="6">
            <v-card elevation="2" :color="creatorCardColor">
              <v-card-title class="d-flex align-center">
                <v-avatar :color="creatorAvatarColor" class="mr-3">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div>{{ match.creatorNickname }}</div>
                  <div class="text-caption">Ersteller</div>
                </div>
                <v-spacer />
                <v-icon v-if="isCreatorWinner" color="warning">mdi-trophy</v-icon>
              </v-card-title>

              <v-card-text v-if="creatorScore">
                <div class="text-h4 mb-2">{{ creatorScore.totalStrokes }} Schläge</div>
                <v-progress-linear
                  :model-value="getScoreProgress(creatorScore.totalStrokes)"
                  :color="getScoreColor(creatorScore.totalStrokes)"
                  height="8"
                  rounded
                />
                <div class="text-caption mt-1">
                  {{ getScoreText(creatorScore.totalStrokes) }}
                </div>
              </v-card-text>

              <v-card-text v-else-if="match.status === 'in_progress'">
                <div class="text-grey">
                  <v-icon class="mr-1">mdi-clock-outline</v-icon>
                  Wartet auf Score-Eingabe
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Opponent -->
          <v-col cols="12" md="6">
            <v-card elevation="2" :color="opponentCardColor">
              <v-card-title class="d-flex align-center">
                <v-avatar :color="opponentAvatarColor" class="mr-3">
                  <v-icon color="white">mdi-account-outline</v-icon>
                </v-avatar>
                <div>
                  <div>{{ match.opponentNickname || 'Wartet auf Gegner...' }}</div>
                  <div class="text-caption">Gegner</div>
                </div>
                <v-spacer />
                <v-icon v-if="isOpponentWinner" color="warning">mdi-trophy</v-icon>
              </v-card-title>

              <v-card-text v-if="opponentScore">
                <div class="text-h4 mb-2">{{ opponentScore.totalStrokes }} Schläge</div>
                <v-progress-linear
                  :model-value="getScoreProgress(opponentScore.totalStrokes)"
                  :color="getScoreColor(opponentScore.totalStrokes)"
                  height="8"
                  rounded
                />
                <div class="text-caption mt-1">
                  {{ getScoreText(opponentScore.totalStrokes) }}
                </div>
              </v-card-text>

              <v-card-text v-else-if="match.status === 'waiting'">
                <div class="text-grey">
                  <v-icon class="mr-1">mdi-account-plus</v-icon>
                  Wartet auf Beitritt
                </div>
              </v-card-text>

              <v-card-text v-else-if="match.status === 'in_progress'">
                <div class="text-grey">
                  <v-icon class="mr-1">mdi-clock-outline</v-icon>
                  Wartet auf Score-Eingabe
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Winner Announcement -->
        <v-card
          v-if="match.status === 'completed' && match.winnerNickname"
          class="mb-4"
          color="success"
          dark
          elevation="3"
        >
          <v-card-text class="text-center pa-6">
            <v-icon size="64" class="mb-3">mdi-trophy</v-icon>
            <div class="text-h4 mb-2">🎉 {{ match.winnerNickname }} gewinnt! 🎉</div>
            <div class="text-subtitle-1">
              Herzlichen Glückwunsch zum Sieg!
            </div>
          </v-card-text>
        </v-card>

        <!-- Detailed Scores -->
        <v-card v-if="hasScores" elevation="2">
          <v-card-title>
            <v-icon class="mr-2">mdi-golf-tee</v-icon>
            Detaillierte Scores
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Loch</th>
                  <th v-if="creatorScore">{{ match.creatorNickname }}</th>
                  <th v-if="opponentScore">{{ match.opponentNickname }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hole in match.holes" :key="hole">
                  <td class="font-weight-bold">{{ hole }}</td>
                  <td v-if="creatorScore">
                    {{ getHoleScore(creatorScore, hole) }}
                  </td>
                  <td v-if="opponentScore">
                    {{ getHoleScore(opponentScore, hole) }}
                  </td>
                </tr>
                <tr class="font-weight-bold">
                  <td>Gesamt</td>
                  <td v-if="creatorScore">{{ creatorScore.totalStrokes }}</td>
                  <td v-if="opponentScore">{{ opponentScore.totalStrokes }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Share Match -->
        <v-card v-if="canShare" class="mt-4" elevation="1">
          <v-card-title>
            <v-icon class="mr-2">mdi-share</v-icon>
            Duell teilen
          </v-card-title>
          <v-card-text>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-content-copy"
                @click="copyCode"
              >
                Code kopieren
              </v-btn>
              
              <v-btn
                variant="outlined"
                prepend-icon="mdi-share"
                @click="shareMatch"
              >
                Link teilen
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>

      <!-- Loading State -->
      <v-container v-else class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-h6 mt-4">Lade Duell...</div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, useMatchesStore } from '@/stores'
import type { Match, PlayerScore } from '@/types'

// Stores
const userStore = useUserStore()
const matchesStore = useMatchesStore()
const router = useRouter()
const route = useRoute()

// State
const match = ref<Match | null>(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const statusColor = computed(() => {
  if (!match.value) return 'grey'
  switch (match.value.status) {
    case 'waiting': return 'orange'
    case 'in_progress': return 'blue'
    case 'completed': return 'green'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  if (!match.value) return 'mdi-help'
  switch (match.value.status) {
    case 'waiting': return 'mdi-clock-outline'
    case 'in_progress': return 'mdi-play'
    case 'completed': return 'mdi-check-circle'
    default: return 'mdi-help'
  }
})

const statusText = computed(() => {
  if (!match.value) return 'Unbekannt'
  switch (match.value.status) {
    case 'waiting': return 'Wartend'
    case 'in_progress': return 'Läuft'
    case 'completed': return 'Beendet'
    default: return 'Unbekannt'
  }
})

const creatorScore = computed(() => {
  if (!match.value) return null
  return match.value.playerScores.find(ps => ps.playerId === match.value!.creatorId)
})

const opponentScore = computed(() => {
  if (!match.value) return null
  return match.value.playerScores.find(ps => ps.playerId === match.value!.opponentId)
})

const userScore = computed(() => {
  if (!match.value || !userStore.currentUser) return null
  return match.value.playerScores.find(ps => ps.playerId === userStore.currentUser!.id)
})

const isCreatorWinner = computed(() => {
  return match.value?.winnerId === match.value?.creatorId
})

const isOpponentWinner = computed(() => {
  return match.value?.winnerId === match.value?.opponentId
})

const creatorCardColor = computed(() => {
  if (match.value?.status === 'completed') {
    return isCreatorWinner.value ? 'success' : 'default'
  }
  return 'default'
})

const opponentCardColor = computed(() => {
  if (match.value?.status === 'completed') {
    return isOpponentWinner.value ? 'success' : 'default'
  }
  return 'default'
})

const creatorAvatarColor = computed(() => {
  return isCreatorWinner.value ? 'warning' : 'primary'
})

const opponentAvatarColor = computed(() => {
  return isOpponentWinner.value ? 'warning' : 'secondary'
})

const hasScores = computed(() => {
  return creatorScore.value || opponentScore.value
})

const canEnterScore = computed(() => {
  if (!match.value || !userStore.currentUser) return false
  if (match.value.status !== 'in_progress') return false
  
  const isParticipant = match.value.creatorId === userStore.currentUser.id || 
                       match.value.opponentId === userStore.currentUser.id
  
  return isParticipant && !userScore.value?.isComplete
})

const canShare = computed(() => {
  return match.value?.status === 'waiting' && 
         match.value?.creatorId === userStore.currentUser?.id
})

// Methods
function loadMatch() {
  const matchId = route.params.id as string
  const foundMatch = matchesStore.getMatchById(matchId)
  
  if (foundMatch) {
    match.value = foundMatch
  } else {
    showSnackbar('Duell nicht gefunden', 'error')
    router.push('/')
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getScoreProgress(totalStrokes: number): number {
  if (!match.value) return 0
  const par = match.value.holes === 9 ? 36 : 72
  const maxStrokes = par * 2 // Assume max is double par
  return Math.min((totalStrokes / maxStrokes) * 100, 100)
}

function getScoreColor(totalStrokes: number): string {
  if (!match.value) return 'grey'
  const par = match.value.holes === 9 ? 36 : 72
  const diff = totalStrokes - par
  
  if (diff <= -10) return 'purple'
  if (diff <= -5) return 'green'
  if (diff <= 0) return 'blue'
  if (diff <= 5) return 'orange'
  return 'red'
}

function getScoreText(totalStrokes: number): string {
  if (!match.value) return ''
  const par = match.value.holes === 9 ? 36 : 72
  const diff = totalStrokes - par
  
  if (diff <= -10) return 'Fantastisch!'
  if (diff <= -5) return 'Sehr gut'
  if (diff <= 0) return 'Gut'
  if (diff <= 5) return 'Okay'
  return 'Übung macht den Meister'
}

function getHoleScore(playerScore: PlayerScore, hole: number): number {
  const score = playerScore.scores.find(s => s.hole === hole)
  return score ? score.strokes : 0
}

function enterScore() {
  if (match.value) {
    matchesStore.setCurrentMatch(match.value)
    router.push(`/match/${match.value.id}/score`)
  }
}

async function copyCode() {
  if (match.value) {
    try {
      await navigator.clipboard.writeText(match.value.code)
      showSnackbar('Code kopiert!', 'success')
    } catch (error) {
      console.error('Error copying code:', error)
      showSnackbar('Fehler beim Kopieren', 'error')
    }
  }
}

async function shareMatch() {
  if (!match.value) return

  const shareData = {
    title: 'GolfDuell Einladung',
    text: `${userStore.userNickname} fordert dich zu einem Golf-Duell heraus! Code: ${match.value.code}`,
    url: `${window.location.origin}/join/${match.value.code}`
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.log('Sharing cancelled')
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url)
      showSnackbar('Link kopiert!', 'success')
    } catch (error) {
      console.error('Error copying link:', error)
      showSnackbar('Fehler beim Kopieren', 'error')
    }
  }
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}

// Lifecycle
onMounted(() => {
  loadMatch()
})
</script>

