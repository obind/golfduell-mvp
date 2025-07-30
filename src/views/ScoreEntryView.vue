<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="goBack" />
      <v-toolbar-title>Score eingeben</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6" v-if="match">
        <!-- Match Info -->
        <v-card class="mb-4" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-golf</v-icon>
            {{ match.holes }} Löcher Duell
            <v-spacer />
            <v-chip color="primary" variant="outlined">
              {{ match.code }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="small">mdi-account</v-icon>
              <span class="mr-4">{{ match.creatorNickname }}</span>
              <span class="text-grey">vs</span>
              <span class="ml-4">{{ match.opponentNickname }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Score Input Component -->
        <ScoreInput
          :holes="match.holes"
          :initial-scores="existingScores"
          @submit="submitScore"
          @cancel="goBack"
        />
      </v-container>

      <!-- Loading State -->
      <v-container v-else class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-h6 mt-4">Lade Duell...</div>
      </v-container>
    </v-main>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Score bestätigen</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-h6 mb-2">Dein Score:</div>
            <div class="text-h4 text-primary">{{ submittedScores?.reduce((sum, s) => sum + s.strokes, 0) }} Schläge</div>
          </div>

          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <strong>Achtung:</strong> Nach dem Speichern kann der Score nicht mehr geändert werden.
          </v-alert>

          <div class="text-body-2">
            Möchtest du diesen Score wirklich speichern?
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showConfirmDialog = false">Abbrechen</v-btn>
          <v-btn
            color="primary"
            :loading="isSubmitting"
            @click="confirmSubmit"
          >
            Score speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-center pa-6">
          <v-icon size="64" color="success" class="mb-3">mdi-check-circle</v-icon>
          <div class="text-h5">Score gespeichert!</div>
        </v-card-title>

        <v-card-text class="text-center">
          <div class="mb-4">
            <div class="text-h6 mb-2">Dein Score:</div>
            <div class="text-h4 text-primary">{{ finalTotalStrokes }} Schläge</div>
          </div>

          <v-alert
            v-if="isMatchComplete"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-trophy</v-icon>
            </template>
            Das Duell ist beendet! Beide Spieler haben ihre Scores eingegeben.
          </v-alert>

          <v-alert
            v-else
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-clock</v-icon>
            </template>
            Warte auf den Score deines Gegners, um das Ergebnis zu sehen.
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn
            variant="outlined"
            @click="goHome"
            class="flex-grow-1"
          >
            Zur Startseite
          </v-btn>
          
          <v-btn
            color="primary"
            variant="elevated"
            @click="viewMatch"
            class="flex-grow-1 ml-3"
          >
            Duell anzeigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import ScoreInput from '@/components/ScoreInput.vue'
import type { Match, Score } from '@/types'

// Stores
const userStore = useUserStore()
const matchesStore = useMatchesStore()
const router = useRouter()
const route = useRoute()

// State
const match = ref<Match | null>(null)
const submittedScores = ref<Score[] | null>(null)
const showConfirmDialog = ref(false)
const showSuccessDialog = ref(false)
const isSubmitting = ref(false)
const finalTotalStrokes = ref(0)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const existingScores = computed(() => {
  if (!match.value || !userStore.currentUser) return []
  
  const userScore = match.value.playerScores.find(ps => 
    ps.playerId === userStore.currentUser!.id
  )
  
  return userScore ? userScore.scores : []
})

const isMatchComplete = computed(() => {
  return match.value?.status === 'completed'
})

// Methods
function loadMatch() {
  const matchId = route.params.id as string
  let foundMatch = matchesStore.getMatchById(matchId)
  
  // Also check current match
  if (!foundMatch && matchesStore.currentMatch?.id === matchId) {
    foundMatch = matchesStore.currentMatch
  }
  
  if (foundMatch) {
    match.value = foundMatch
    
    // Check if user can enter score
    if (!canEnterScore()) {
      showSnackbar('Du kannst für dieses Duell keinen Score eingeben', 'error')
      router.push(`/match/${matchId}`)
      return
    }
  } else {
    showSnackbar('Duell nicht gefunden', 'error')
    router.push('/')
  }
}

function canEnterScore(): boolean {
  if (!match.value || !userStore.currentUser) return false
  if (match.value.status !== 'in_progress') return false
  
  const isParticipant = match.value.creatorId === userStore.currentUser.id || 
                       match.value.opponentId === userStore.currentUser.id
  
  const userScore = match.value.playerScores.find(ps => 
    ps.playerId === userStore.currentUser!.id
  )
  
  return isParticipant && !userScore?.isComplete
}

function submitScore(scores: Score[]) {
  submittedScores.value = scores
  showConfirmDialog.value = true
}

async function confirmSubmit() {
  if (!match.value || !submittedScores.value) return
  
  isSubmitting.value = true
  
  try {
    matchesStore.submitScore(match.value.id, submittedScores.value)
    
    finalTotalStrokes.value = submittedScores.value.reduce((sum, score) => sum + score.strokes, 0)
    
    // Reload match to get updated status
    const updatedMatch = matchesStore.getMatchById(match.value.id)
    if (updatedMatch) {
      match.value = updatedMatch
    }
    
    showConfirmDialog.value = false
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Error submitting score:', error)
    showSnackbar('Fehler beim Speichern des Scores', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  if (match.value) {
    router.push(`/match/${match.value.id}`)
  } else {
    router.push('/')
  }
}

function goHome() {
  showSuccessDialog.value = false
  router.push('/')
}

function viewMatch() {
  if (match.value) {
    showSuccessDialog.value = false
    router.push(`/match/${match.value.id}`)
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

