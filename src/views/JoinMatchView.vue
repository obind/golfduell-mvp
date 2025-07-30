<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Duell beitreten</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card elevation="4">
              <v-card-title class="text-center pa-6">
                <v-icon size="large" color="primary" class="mb-2">mdi-account-plus</v-icon>
                <div class="text-h4">Duell beitreten</div>
                <div class="text-subtitle-1 text-grey">
                  Gib den Duell-Code ein, um einem bestehenden Duell beizutreten
                </div>
              </v-card-title>

              <v-card-text class="px-6">
                <v-form ref="form" v-model="isFormValid" @submit.prevent="joinMatch">
                  <!-- Code Input -->
                  <v-text-field
                    v-model="matchCode"
                    label="Duell-Code"
                    placeholder="z.B. ABC123"
                    variant="outlined"
                    size="large"
                    :rules="codeRules"
                    :loading="isSearching"
                    :error-messages="errorMessage"
                    counter="6"
                    maxlength="6"
                    class="mb-4"
                    @input="onCodeInput"
                    @keyup.enter="joinMatch"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-key</v-icon>
                    </template>
                    <template v-slot:append-inner>
                      <v-btn
                        v-if="matchCode.length === 6"
                        icon="mdi-magnify"
                        variant="text"
                        size="small"
                        @click="searchMatch"
                      />
                    </template>
                  </v-text-field>

                  <!-- Match Preview -->
                  <v-card
                    v-if="foundMatch"
                    variant="outlined"
                    color="success"
                    class="mb-4"
                  >
                    <v-card-title class="text-h6">
                      <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
                      Duell gefunden!
                    </v-card-title>
                    <v-card-text>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" size="small">mdi-account</v-icon>
                        <strong>{{ foundMatch.creatorNickname }}</strong>
                        <v-chip size="small" color="primary" class="ml-2">Ersteller</v-chip>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" size="small">mdi-golf-tee</v-icon>
                        <span>{{ foundMatch.holes }} Löcher</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" size="small">mdi-clock</v-icon>
                        <span>Erstellt: {{ formatDate(foundMatch.createdAt) }}</span>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- Info Alert -->
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-information</v-icon>
                    </template>
                    <div class="text-body-2">
                      <strong>Hinweis:</strong><br>
                      Du kannst nur Duellen beitreten, die noch auf einen Gegner warten.
                      Nach dem Beitritt könnt ihr beide eure Scores eingeben.
                    </div>
                  </v-alert>
                </v-form>
              </v-card-text>

              <v-card-actions class="px-6 pb-6">
                <v-btn
                  variant="outlined"
                  @click="$router.back()"
                  class="flex-grow-1"
                >
                  Abbrechen
                </v-btn>
                
                <v-btn
                  color="primary"
                  variant="elevated"
                  :loading="isJoining"
                  :disabled="!foundMatch || !isFormValid"
                  @click="joinMatch"
                  class="flex-grow-1 ml-3"
                  prepend-icon="mdi-account-plus"
                >
                  Beitreten
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Recent Codes -->
            <v-card v-if="recentCodes.length > 0" class="mt-4" elevation="2">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-history</v-icon>
                Zuletzt verwendet
              </v-card-title>
              <v-card-text>
                <v-chip-group>
                  <v-chip
                    v-for="code in recentCodes"
                    :key="code"
                    variant="outlined"
                    @click="matchCode = code"
                  >
                    {{ code }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-center pa-6">
          <v-icon size="64" color="success" class="mb-3">mdi-check-circle</v-icon>
          <div class="text-h5">Erfolgreich beigetreten!</div>
        </v-card-title>

        <v-card-text class="text-center">
          <div class="mb-4">
            <div class="text-body-1">
              Du bist dem Duell von <strong>{{ foundMatch?.creatorNickname }}</strong> beigetreten.
            </div>
          </div>

          <v-alert
            type="success"
            variant="tonal"
            class="mb-4"
          >
            Das Duell kann jetzt beginnen! Beide Spieler können ihre Scores eingeben.
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
import type { Match } from '@/types'

// Stores
const userStore = useUserStore()
const matchesStore = useMatchesStore()
const router = useRouter()
const route = useRoute()

// State
const form = ref()
const isFormValid = ref(false)
const matchCode = ref('')
const isSearching = ref(false)
const isJoining = ref(false)
const foundMatch = ref<Match | null>(null)
const errorMessage = ref('')
const showSuccessDialog = ref(false)
const recentCodes = ref<string[]>([])
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const codeRules = [
  (value: string) => !!value || 'Code ist erforderlich',
  (value: string) => value.length === 6 || 'Code muss 6 Zeichen lang sein',
  (value: string) => /^[A-Z0-9]+$/.test(value) || 'Nur Großbuchstaben und Zahlen erlaubt'
]

// Methods
function onCodeInput() {
  matchCode.value = matchCode.value.toUpperCase()
  errorMessage.value = ''
  foundMatch.value = null
  
  if (matchCode.value.length === 6) {
    searchMatch()
  }
}

function searchMatch() {
  if (matchCode.value.length !== 6) return
  
  isSearching.value = true
  errorMessage.value = ''
  
  try {
    const match = matchesStore.getMatchByCode(matchCode.value)
    
    if (!match) {
      errorMessage.value = 'Duell mit diesem Code nicht gefunden'
      foundMatch.value = null
    } else if (match.status !== 'waiting') {
      errorMessage.value = 'Dieses Duell läuft bereits oder ist beendet'
      foundMatch.value = null
    } else if (match.creatorId === userStore.currentUser?.id) {
      errorMessage.value = 'Du kannst deinem eigenen Duell nicht beitreten'
      foundMatch.value = null
    } else {
      foundMatch.value = match
      errorMessage.value = ''
    }
  } catch (error) {
    console.error('Error searching match:', error)
    errorMessage.value = 'Fehler bei der Suche'
    foundMatch.value = null
  } finally {
    isSearching.value = false
  }
}

async function joinMatch() {
  if (!foundMatch.value || !isFormValid.value) return

  isJoining.value = true
  
  try {
    const match = matchesStore.joinMatch(matchCode.value)
    foundMatch.value = match
    
    // Save to recent codes
    saveRecentCode(matchCode.value)
    
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Error joining match:', error)
    showSnackbar('Fehler beim Beitreten des Duells', 'error')
  } finally {
    isJoining.value = false
  }
}

function saveRecentCode(code: string) {
  const recent = [...recentCodes.value]
  const index = recent.indexOf(code)
  
  if (index > -1) {
    recent.splice(index, 1)
  }
  
  recent.unshift(code)
  recentCodes.value = recent.slice(0, 5) // Keep only last 5
  
  localStorage.setItem('golfduell_recent_codes', JSON.stringify(recentCodes.value))
}

function loadRecentCodes() {
  try {
    const stored = localStorage.getItem('golfduell_recent_codes')
    if (stored) {
      recentCodes.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading recent codes:', error)
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

function goHome() {
  showSuccessDialog.value = false
  router.push('/')
}

function viewMatch() {
  if (foundMatch.value) {
    showSuccessDialog.value = false
    router.push(`/match/${foundMatch.value.id}`)
  }
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}

// Lifecycle
onMounted(() => {
  loadRecentCodes()
  
  // Check if code is provided in route params
  if (route.params.code) {
    matchCode.value = String(route.params.code).toUpperCase()
    searchMatch()
  }
})
</script>

