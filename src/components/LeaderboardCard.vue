<template>
  <v-card class="mb-3" :elevation="rank <= 3 ? 4 : 1">
    <v-card-text class="py-3">
      <div class="d-flex align-center">
        <!-- Rank Badge -->
        <div class="rank-badge mr-3">
          <v-avatar
            :color="rankColor"
            :size="rank <= 3 ? 48 : 40"
          >
            <v-icon v-if="rank <= 3" color="white" :size="rank === 1 ? 'large' : 'default'">
              {{ rankIcon }}
            </v-icon>
            <span v-else class="text-h6 font-weight-bold text-white">
              {{ rank }}
            </span>
          </v-avatar>
        </div>

        <!-- Friend Info -->
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-1">
            <span class="text-h6" :class="rank <= 3 ? 'font-weight-bold' : ''">
              {{ friend.nickname }}
            </span>
            <v-chip
              v-if="rank === 1"
              color="warning"
              size="x-small"
              variant="elevated"
              class="ml-2"
              prepend-icon="mdi-crown"
            >
              Champion
            </v-chip>
          </div>
          
          <div class="text-caption text-grey">
            {{ friend.totalMatches }} Spiele gespielt
          </div>
        </div>

        <!-- Stats -->
        <div class="text-right">
          <div class="d-flex align-center justify-end mb-1">
            <div class="mr-3">
              <div class="text-success font-weight-bold text-h6">
                {{ friend.wins }}
              </div>
              <div class="text-caption text-grey">Siege</div>
            </div>
            
            <div class="mr-3">
              <div class="text-error font-weight-bold text-h6">
                {{ friend.losses }}
              </div>
              <div class="text-caption text-grey">Niederlagen</div>
            </div>
            
            <div>
              <div class="font-weight-bold text-h6" :class="winRateColorClass">
                {{ winRateText }}
              </div>
              <div class="text-caption text-grey">Siegrate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar for Win Rate -->
      <v-progress-linear
        v-if="friend.totalMatches > 0"
        :model-value="winRate"
        :color="winRateColor"
        height="6"
        rounded
        class="mt-3"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Friend } from '@/types'

// Props
interface Props {
  friend: Friend
  rank: number
}

const props = defineProps<Props>()

// Computed
const rankColor = computed(() => {
  switch (props.rank) {
    case 1: return 'warning' // Gold
    case 2: return 'grey-lighten-1' // Silver
    case 3: return 'deep-orange-lighten-1' // Bronze
    default: return 'primary'
  }
})

const rankIcon = computed(() => {
  switch (props.rank) {
    case 1: return 'mdi-trophy'
    case 2: return 'mdi-medal'
    case 3: return 'mdi-medal-outline'
    default: return 'mdi-account'
  }
})

const winRate = computed(() => {
  if (props.friend.totalMatches === 0) return 0
  return (props.friend.wins / props.friend.totalMatches) * 100
})

const winRateColor = computed(() => {
  const rate = winRate.value
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'light-green'
  if (rate >= 40) return 'warning'
  return 'error'
})

const winRateColorClass = computed(() => {
  const rate = winRate.value
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-light-green'
  if (rate >= 40) return 'text-warning'
  return 'text-error'
})

const winRateText = computed(() => {
  return `${Math.round(winRate.value)}%`
})
</script>

<style scoped>
.rank-badge {
  position: relative;
}
</style>

