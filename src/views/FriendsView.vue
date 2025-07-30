<template>
  <v-container fluid class="pa-0">
    <!-- App Bar -->
    <v-app-bar color="primary" dark elevation="2">
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
      <v-toolbar-title>Freunde</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-account-plus" @click="showAddFriendDialog = true" />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="py-6">
        <!-- Stats Card -->
        <v-card class="mb-4" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Freunde Übersicht
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-primary">{{ friendsStore.friendsCount }}</div>
                  <div class="text-caption">Freunde</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-success">{{ totalGamesWithFriends }}</div>
                  <div class="text-caption">Spiele gespielt</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-info">{{ activeFriendsCount }}</div>
                  <div class="text-caption">Aktive Freunde</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 text-warning">{{ topFriend?.nickname || '-' }}</div>
                  <div class="text-caption">Top Gegner</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Search and Filter -->
        <v-card class="mb-4" elevation="1">
          <v-card-text class="pb-2">
            <v-row align="center">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchQuery"
                  label="Freunde suchen"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  label="Sortieren nach"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Friends List -->
        <div v-if="filteredFriends.length === 0 && friendsStore.friendsCount === 0">
          <!-- Empty State -->
          <v-card class="text-center pa-8" elevation="2">
            <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
            <v-card-title class="text-h5 mb-2">Noch keine Freunde</v-card-title>
            <v-card-text class="text-body-1 mb-4">
              Füge Freunde hinzu, um gegen sie zu spielen und eure Statistiken zu verfolgen
            </v-card-text>
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              @click="showAddFriendDialog = true"
            >
              Ersten Freund hinzufügen
            </v-btn>
          </v-card>
        </div>

        <div v-else-if="filteredFriends.length === 0">
          <!-- No Search Results -->
          <v-card class="text-center pa-6" elevation="1">
            <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-magnify</v-icon>
            <v-card-title class="text-h6 mb-2">Keine Ergebnisse</v-card-title>
            <v-card-text>
              Keine Freunde gefunden für "{{ searchQuery }}"
            </v-card-text>
          </v-card>
        </div>

        <div v-else>
          <FriendCard
            v-for="friend in filteredFriends"
            :key="friend.id"
            :friend="friend"
            @challenge="challengeFriend"
            @remove="confirmRemoveFriend"
          />
        </div>

        <!-- Floating Action Button -->
        <v-fab
          icon="mdi-account-plus"
          color="primary"
          location="bottom end"
          size="large"
          @click="showAddFriendDialog = true"
        />
      </v-container>
    </v-main>

    <!-- Add Friend Dialog -->
    <v-dialog v-model="showAddFriendDialog" max-width="400">
      <v-card>
        <v-card-title>Freund hinzufügen</v-card-title>
        <v-card-text>
          <v-form ref="addFriendForm" v-model="isAddFriendFormValid">
            <v-text-field
              v-model="newFriendNickname"
              label="Nickname"
              :rules="nicknameRules"
              :error-messages="addFriendError"
              variant="outlined"
              counter="20"
              maxlength="20"
              @keyup.enter="addFriend"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelAddFriend">Abbrechen</v-btn>
          <v-btn
            color="primary"
            :disabled="!isAddFriendFormValid"
            @click="addFriend"
          >
            Hinzufügen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remove Friend Confirmation -->
    <v-dialog v-model="showRemoveDialog" max-width="400">
      <v-card>
        <v-card-title>Freund entfernen</v-card-title>
        <v-card-text>
          Möchtest du <strong>{{ friendToRemove?.nickname }}</strong> wirklich aus deiner Freundesliste entfernen?
          <br><br>
          <small class="text-grey">
            Die Spielstatistiken bleiben erhalten, aber der Freund wird nicht mehr in der Liste angezeigt.
          </small>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showRemoveDialog = false">Abbrechen</v-btn>
          <v-btn color="error" @click="removeFriend">Entfernen</v-btn>
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
import { useFriendsStore } from '@/stores'
import FriendCard from '@/components/FriendCard.vue'
import type { Friend } from '@/types'

// Stores
const friendsStore = useFriendsStore()
const router = useRouter()

// State
const searchQuery = ref('')
const sortBy = ref('name')
const showAddFriendDialog = ref(false)
const showRemoveDialog = ref(false)
const newFriendNickname = ref('')
const isAddFriendFormValid = ref(false)
const addFriendError = ref('')
const friendToRemove = ref<Friend | null>(null)
const addFriendForm = ref()
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const sortOptions = [
  { title: 'Name', value: 'name' },
  { title: 'Siege', value: 'wins' },
  { title: 'Spiele', value: 'games' },
  { title: 'Siegrate', value: 'winrate' },
  { title: 'Hinzugefügt', value: 'added' }
]

const filteredFriends = computed(() => {
  let friends = [...friendsStore.friendsList]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    friends = friends.filter(friend => 
      friend.nickname.toLowerCase().includes(query)
    )
  }
  
  // Sort friends
  friends.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.nickname.localeCompare(b.nickname)
      case 'wins':
        return b.wins - a.wins
      case 'games':
        return b.totalMatches - a.totalMatches
      case 'winrate':
        const aRate = a.totalMatches > 0 ? a.wins / a.totalMatches : 0
        const bRate = b.totalMatches > 0 ? b.wins / b.totalMatches : 0
        return bRate - aRate
      case 'added':
        return b.addedAt.getTime() - a.addedAt.getTime()
      default:
        return 0
    }
  })
  
  return friends
})

const totalGamesWithFriends = computed(() => {
  return friendsStore.friendsList.reduce((sum, friend) => sum + friend.totalMatches, 0)
})

const activeFriendsCount = computed(() => {
  return friendsStore.friendsList.filter(friend => friend.totalMatches > 0).length
})

const topFriend = computed(() => {
  return friendsStore.friendsList
    .filter(friend => friend.totalMatches > 0)
    .sort((a, b) => b.totalMatches - a.totalMatches)[0]
})

const nicknameRules = [
  (value: string) => !!value || 'Nickname ist erforderlich',
  (value: string) => value.length >= 3 || 'Mindestens 3 Zeichen',
  (value: string) => value.length <= 20 || 'Maximal 20 Zeichen',
  (value: string) => /^[a-zA-Z0-9_-]+$/.test(value) || 'Nur Buchstaben, Zahlen, _ und - erlaubt'
]

// Methods
function addFriend() {
  if (!isAddFriendFormValid.value) return
  
  try {
    friendsStore.addFriend(newFriendNickname.value)
    showSnackbar('Freund hinzugefügt', 'success')
    cancelAddFriend()
  } catch (error) {
    addFriendError.value = 'Freund mit diesem Nickname existiert bereits'
  }
}

function cancelAddFriend() {
  showAddFriendDialog.value = false
  newFriendNickname.value = ''
  addFriendError.value = ''
  if (addFriendForm.value) {
    addFriendForm.value.reset()
  }
}

function challengeFriend(friend: Friend) {
  router.push('/create-match')
}

function confirmRemoveFriend(friend: Friend) {
  friendToRemove.value = friend
  showRemoveDialog.value = true
}

function removeFriend() {
  if (friendToRemove.value) {
    friendsStore.removeFriend(friendToRemove.value.id)
    showSnackbar('Freund entfernt', 'success')
    showRemoveDialog.value = false
    friendToRemove.value = null
  }
}

function showSnackbar(text: string, color: string = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>

