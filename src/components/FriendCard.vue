<template>
  <v-card class="mb-3" elevation="1">
    <v-card-text class="py-3">
      <div class="d-flex align-center">
        <v-avatar
          :color="avatarColor"
          class="mr-3"
        >
          <v-icon color="white">mdi-account</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <div class="text-h6 mb-1">{{ friend.nickname }}</div>
          <div class="text-caption text-grey">
            Hinzugefügt: {{ formatDate(friend.addedAt) }}
          </div>
        </div>

        <div class="text-right">
          <div class="d-flex align-center mb-1">
            <v-icon size="small" class="mr-1" color="success">mdi-trophy</v-icon>
            <span class="text-success font-weight-bold">{{ friend.wins }}</span>
            <span class="mx-1 text-grey">-</span>
            <span class="text-error font-weight-bold">{{ friend.losses }}</span>
            <v-icon size="small" class="ml-1" color="error">mdi-close</v-icon>
          </div>
          
          <div class="text-caption text-grey">
            {{ friend.totalMatches }} Spiele
          </div>
          
          <v-chip
            v-if="friend.totalMatches > 0"
            :color="winRateColor"
            size="x-small"
            variant="outlined"
            class="mt-1"
          >
            {{ winRateText }}
          </v-chip>
        </div>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
              class="ml-2"
            />
          </template>
          
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-golf"
              title="Neues Duell"
              @click="$emit('challenge', friend)"
            />
            <v-list-item
              prepend-icon="mdi-delete"
              title="Entfernen"
              @click="$emit('remove', friend)"
            />
          </v-list>
        </v-menu>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Friend } from '@/types'

// Props
interface Props {
  friend: Friend
  rank?: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'challenge': [friend: Friend]
  'remove': [friend: Friend]
}>()

// Computed
const avatarColor = computed(() => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const index = props.friend.nickname.length % colors.length
  return colors[index]
})

const winRate = computed(() => {
  if (props.friend.totalMatches === 0) return 0
  return (props.friend.wins / props.friend.totalMatches) * 100
})

const winRateColor = computed(() => {
  const rate = winRate.value
  if (rate >= 70) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
})

const winRateText = computed(() => {
  return `${Math.round(winRate.value)}%`
})

// Methods
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

