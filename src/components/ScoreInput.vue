<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-golf</v-icon>
      Score eingeben - {{ holes }} Löcher
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="isFormValid">
        <div class="score-grid">
          <div
            v-for="hole in holes"
            :key="hole"
            class="score-item"
          >
            <v-text-field
              v-model.number="scores[hole - 1]"
              :label="`Loch ${hole}`"
              type="number"
              min="1"
              max="15"
              :rules="scoreRules"
              variant="outlined"
              density="compact"
              hide-details="auto"
              class="score-input"
            >
              <template v-slot:prepend-inner>
                <v-icon size="small">mdi-golf-tee</v-icon>
              </template>
            </v-text-field>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="d-flex align-center justify-space-between">
          <div class="text-h6">
            <v-icon class="mr-2">mdi-calculator</v-icon>
            Gesamt: {{ totalStrokes }} Schläge
          </div>
          
          <v-chip
            :color="getScoreColor(totalStrokes)"
            variant="elevated"
            size="large"
          >
            {{ getScoreText(totalStrokes) }}
          </v-chip>
        </div>

        <v-alert
          v-if="totalStrokes > 0"
          :color="getScoreColor(totalStrokes)"
          variant="tonal"
          class="mt-4"
        >
          <template v-slot:prepend>
            <v-icon>{{ getScoreIcon(totalStrokes) }}</v-icon>
          </template>
          {{ getScoreDescription(totalStrokes) }}
        </v-alert>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn
        @click="$emit('cancel')"
        variant="outlined"
      >
        Abbrechen
      </v-btn>
      
      <v-spacer />
      
      <v-btn
        color="primary"
        variant="elevated"
        :disabled="!canSubmit"
        @click="submitScore"
        prepend-icon="mdi-check"
      >
        Score speichern
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Score } from '@/types'

// Props
interface Props {
  holes: number
  initialScores?: Score[]
}

const props = withDefaults(defineProps<Props>(), {
  initialScores: () => []
})

// Emits
const emit = defineEmits<{
  'submit': [scores: Score[]]
  'cancel': []
}>()

// State
const form = ref()
const isFormValid = ref(false)
const scores = ref<number[]>(new Array(props.holes).fill(0))

// Initialize scores if provided
if (props.initialScores.length > 0) {
  props.initialScores.forEach((score, index) => {
    if (index < scores.value.length) {
      scores.value[index] = score.strokes
    }
  })
}

// Computed
const totalStrokes = computed(() => {
  return scores.value.reduce((sum, strokes) => sum + (strokes || 0), 0)
})

const canSubmit = computed(() => {
  return isFormValid.value && 
         scores.value.every(score => score > 0 && score <= 15) &&
         totalStrokes.value > 0
})

const scoreRules = [
  (value: number) => !!value || 'Schläge erforderlich',
  (value: number) => value >= 1 || 'Mindestens 1 Schlag',
  (value: number) => value <= 15 || 'Maximal 15 Schläge'
]

// Methods
function getScoreColor(total: number): string {
  const par = props.holes === 9 ? 36 : 72
  const diff = total - par
  
  if (diff <= -10) return 'purple'
  if (diff <= -5) return 'green'
  if (diff <= 0) return 'blue'
  if (diff <= 5) return 'orange'
  return 'red'
}

function getScoreText(total: number): string {
  const par = props.holes === 9 ? 36 : 72
  const diff = total - par
  
  if (diff <= -10) return 'Fantastisch!'
  if (diff <= -5) return 'Sehr gut'
  if (diff <= 0) return 'Gut'
  if (diff <= 5) return 'Okay'
  return 'Übung macht den Meister'
}

function getScoreIcon(total: number): string {
  const par = props.holes === 9 ? 36 : 72
  const diff = total - par
  
  if (diff <= -10) return 'mdi-star'
  if (diff <= -5) return 'mdi-thumb-up'
  if (diff <= 0) return 'mdi-check'
  if (diff <= 5) return 'mdi-minus'
  return 'mdi-trending-up'
}

function getScoreDescription(total: number): string {
  const par = props.holes === 9 ? 36 : 72
  const diff = total - par
  
  if (diff <= -10) return 'Unglaubliche Leistung! Du spielst wie ein Profi!'
  if (diff <= -5) return 'Sehr starke Runde! Weiter so!'
  if (diff <= 0) return 'Solide Runde! Du bist auf einem guten Weg.'
  if (diff <= 5) return 'Nicht schlecht! Mit etwas Übung wird es noch besser.'
  return 'Jeder fängt mal an. Übung macht den Meister!'
}

function submitScore() {
  if (canSubmit.value) {
    const scoreData: Score[] = scores.value.map((strokes, index) => ({
      hole: index + 1,
      strokes
    }))
    
    emit('submit', scoreData)
  }
}

// Watch for changes to validate form
watch(scores, () => {
  if (form.value) {
    form.value.validate()
  }
}, { deep: true })
</script>

<style scoped>
.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.score-input {
  max-width: 150px;
}

@media (max-width: 600px) {
  .score-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

