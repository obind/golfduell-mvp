<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Neues Duell erstellen</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card elevation="4">
              <v-card-title class="text-center pa-6">
                <v-icon size="large" color="primary" class="mb-2">mdi-golf</v-icon>
                <div class="text-h4">Neues Duell</div>
                <div class="text-subtitle-1 text-grey">
                  Erstelle ein Golf-Duell und fordere deine Freunde heraus
                </div>
              </v-card-title>

              <v-card-text class="px-6">
                <v-form ref="form" v-model="isFormValid">
                  <!-- Hole Selection -->
                  <div class="mb-6">
                    <v-label class="text-h6 mb-3 d-block">Anzahl Löcher</v-label>
                    <v-btn-toggle
                      v-model="selectedHoles"
                      mandatory
                      variant="outlined"
                      divided
                      class="w-100"
                    >
                      <v-btn
                        :value="9"
                        size="large"
                        class="flex-grow-1"
                        prepend-icon="mdi-golf-tee"
                      >
                        9 Löcher
                        <div class="text-caption">Kurze Runde</div>
                      </v-btn>
                      <v-btn
                        :value="18"
                        size="large"
                        class="flex-grow-1"
                        prepend-icon="mdi-golf"
                      >
                        18 Löcher
                        <div class="text-caption">Volle Runde</div>
                      </v-btn>
                    </v-btn-toggle>
                  </div>

                  <!-- Match Info -->
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-information</v-icon>
                    </template>
                    <div class="text-body-2">
                      <strong>So funktioniert's:</strong><br>
                      1. Duell erstellen und Code teilen<br>
                      2. Beide Spieler tragen ihre Scores ein<br>
                      3. Automatischer Vergleich und Gewinner-Ermittlung
                    </div>
                  </v-alert>

                  <!-- Preview -->
                  <v-card
                    variant="outlined"
                    class="mb-4"
                  >
                    <v-card-title class="text-h6">
                      <v-icon class="mr-2">mdi-eye</v-icon>
                      Duell Vorschau
                    </v-card-title>
                    <v-card-text>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" size="small">mdi-account</v-icon>
                        <strong>{{ userStore.userNickname }}</strong>
                        <v-chip size="small" color="primary" class="ml-2">Ersteller</v-chip>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" size="small">mdi-account-outline</v-icon>
                        <span class="text-grey">Wartet auf Gegner...</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" size="small">mdi-golf-tee</v-icon>
                        <span>{{ selectedHoles }} Löcher</span>
                      </div>
                    </v-card-text>
                  </v-card>
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
                  :loading="isCreating"
                  :disabled="!isFormValid"
                  @click="createMatch"
                  class="flex-grow-1 ml-3"
                  prepend-icon="mdi-plus"
                >
                  Duell erstellen
                </v-btn>
              </v-card-actions>
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
          <div class="text-h5">Duell erstellt!</div>
        </v-card-title>

        <v-card-text class="text-center">
          <div class="mb-4">
            <div class="text-h6 mb-2">Dein Duell-Code:</div>
            <v-chip
              size="x-large"
              color="primary"
              variant="elevated"
              class="text-h5 font-weight-bold"
            >
              {{ createdMatch?.code }}
            </v-chip>
          </div>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Teile diesen Code mit deinem Gegner, damit er dem Duell beitreten kann.
          </v-alert>

          <div class="d-flex gap-2 justify-center">
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
              Teilen
            </v-btn>
          </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useMatchesStore } from '@/stores'
import type { Match, HoleCount } from '@/types'

// Stores
const userStore = useUserStore()
const matchesStore = useMatchesStore()
const router = useRouter()

// State
const form = ref()
const isFormValid = ref(false)
const selectedHoles = ref<HoleCount>(9)
const isCreating = ref(false)
const showSuccessDialog = ref(false)
const createdMatch = ref<Match | null>(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Methods
async function createMatch() {
  if (!isFormValid.value) return

  isCreating.value = true
  
  try {
    const match = matchesStore.createMatch(selectedHoles.value)
    createdMatch.value = match
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Error creating match:', error)
    showSnackbar('Fehler beim Erstellen des Duells', 'error')
  } finally {
    isCreating.value = false
  }
}

async function copyCode() {
  if (createdMatch.value) {
    try {
      await navigator.clipboard.writeText(createdMatch.value.code)
      showSnackbar('Code kopiert!', 'success')
    } catch (error) {
      console.error('Error copying code:', error)
      showSnackbar('Fehler beim Kopieren', 'error')
    }
  }
}

async function shareMatch() {
  if (!createdMatch.value) return

  const shareData = {
    title: 'GolfDuell Einladung',
    text: `${userStore.userNickname} fordert dich zu einem Golf-Duell heraus! Code: ${createdMatch.value.code}`,
    url: `${window.location.origin}/join/${createdMatch.value.code}`
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.log('Sharing cancelled')
    }
  } else {
    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url)
      showSnackbar('Link kopiert!', 'success')
    } catch (error) {
      console.error('Error copying link:', error)
      showSnackbar('Fehler beim Kopieren', 'error')
    }
  }
}

function goHome() {
  showSuccessDialog.value = false
  router.push('/')
}

function viewMatch() {
  if (createdMatch.value) {
    showSuccessDialog.value = false
    router.push(`/match/${createdMatch.value.id}`)
  }
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

