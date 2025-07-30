<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
      <span>{{ match.holes }} Löcher Duell</span>
      <v-spacer />
      <v-chip :color="statusColor" size="small" variant="outlined">
        {{ statusText }}
      </v-chip>
    </v-card-title>

    <v-card-subtitle>
      Code: <strong>{{ match.code }}</strong>
    </v-card-subtitle>

    <v-card-text>
      <div class="mb-2">
        <v-icon class="mr-1" size="small">mdi-account</v-icon>
        <strong>{{ match.creatorNickname }}</strong>
        <span v-if="match.status === 'completed' && creatorScore">
          - {{ creatorScore.totalStrokes }} Schläge
        </span>
      </div>

      <div v-if="match.opponentNickname" class="mb-2">
        <v-icon class="mr-1" size="small">mdi-account-outline</v-icon>
        <strong>{{ match.opponentNickname }}</strong>
        <span v-if="match.status === 'completed' && opponentScore">
          - {{ opponentScore.totalStrokes }} Schläge
        </span>
      </div>

      <div v-else-if="match.status === 'waiting'" class="text-grey">
        <v-icon class="mr-1" size="small">mdi-clock-outline</v-icon>
        Wartet auf Gegner...
      </div>

      <div v-if="match.status === 'completed' && match.winnerNickname" class="mt-2">
        <v-chip color="success" size="small" prepend-icon="mdi-trophy">
          Gewinner: {{ match.winnerNickname }}
        </v-chip>
      </div>

      <div class="text-caption text-grey mt-2">
        Erstellt: {{ formatDate(match.createdAt) }}
        <span v-if="match.completedAt">
          • Beendet: {{ formatDate(match.completedAt) }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn
        v-if="canEnterScore"
        color="primary"
        variant="elevated"
        prepend-icon="mdi-golf"
        @click="$emit('enter-score', match)"
      >
        Score eingeben
      </v-btn>

      <v-btn
        v-if="canViewDetails"
        color="primary"
        variant="outlined"
        prepend-icon="mdi-eye"
        @click="$emit('view-details', match)"
      >
        Details
      </v-btn>

      <v-spacer />

      <v-btn
        v-if="canShare"
        color="secondary"
        variant="text"
        icon="mdi-share"
        @click="shareMatch"
      />

      <v-btn
        v-if="canDelete"
        color="error"
        variant="text"
        icon="mdi-delete"
        @click="$emit('delete-match', match)"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Match } from '@/types'
import { useUserStore } from '@/stores'

// Props
interface Props {
  match: Match
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'enter-score': [match: Match]
  'view-details': [match: Match]
  'delete-match': [match: Match]
}>()

// Stores
const userStore = useUserStore()

// Computed
const statusColor = computed(() => {
  switch (props.match.status) {
    case 'waiting': return 'orange'
    case 'in_progress': return 'blue'
    case 'completed': return 'green'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (props.match.status) {
    case 'waiting': return 'mdi-clock-outline'
    case 'in_progress': return 'mdi-play'
    case 'completed': return 'mdi-check-circle'
    default: return 'mdi-help'
  }
})

const statusText = computed(() => {
  switch (props.match.status) {
    case 'waiting': return 'Wartend'
    case 'in_progress': return 'Läuft'
    case 'completed': return 'Beendet'
    default: return 'Unbekannt'
  }
})

const creatorScore = computed(() => {
  return props.match.playerScores.find(ps => ps.playerId === props.match.creatorId)
})

const opponentScore = computed(() => {
  return props.match.playerScores.find(ps => ps.playerId === props.match.opponentId)
})

const userScore = computed(() => {
  if (!userStore.currentUser) return null
  return props.match.playerScores.find(ps => ps.playerId === userStore.currentUser!.id)
})

const canEnterScore = computed(() => {
  if (!userStore.currentUser) return false
  if (props.match.status !== 'in_progress') return false
  
  const isParticipant = props.match.creatorId === userStore.currentUser.id || 
                       props.match.opponentId === userStore.currentUser.id
  
  return isParticipant && !userScore.value?.isComplete
})

const canViewDetails = computed(() => {
  return props.match.status === 'completed' || userScore.value?.isComplete
})

const canShare = computed(() => {
  return props.match.status === 'waiting' && 
         props.match.creatorId === userStore.currentUser?.id
})

const canDelete = computed(() => {
  return props.match.creatorId === userStore.currentUser?.id && 
         props.match.status === 'waiting'
})

// Methods
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

async function shareMatch() {
  const shareData = {
    title: 'GolfDuell Einladung',
    text: `Tritt meinem Golf-Duell bei! Code: ${props.match.code}`,
    url: `${window.location.origin}/join/${props.match.code}`
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.log('Sharing cancelled')
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareData.url)
    // You could show a snackbar here
  }
}
</script>

