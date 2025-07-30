<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    class="elevation-2"
  >
    <v-list>
      <v-list-item
        prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
        :title="userStore.userNickname"
        subtitle="Golf Player"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="showEditNickname = true"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.route"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.route"
        color="primary"
      />
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          color="error"
          variant="outlined"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- Edit Nickname Dialog -->
  <v-dialog v-model="showEditNickname" max-width="400">
    <v-card>
      <v-card-title>Nickname ändern</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newNickname"
          label="Neuer Nickname"
          :rules="[rules.required, rules.minLength]"
          counter="20"
          maxlength="20"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showEditNickname = false">Abbrechen</v-btn>
        <v-btn
          color="primary"
          @click="updateNickname"
          :disabled="!isNicknameValid"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import type { NavigationItem } from '@/types'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Stores
const userStore = useUserStore()
const router = useRouter()

// State
const showEditNickname = ref(false)
const newNickname = ref('')

// Computed
const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const navigationItems: NavigationItem[] = [
  { title: 'Home', icon: 'mdi-home', route: '/' },
  { title: 'Neues Duell', icon: 'mdi-plus-circle', route: '/create-match' },
  { title: 'Duell beitreten', icon: 'mdi-account-plus', route: '/join-match' },
  { title: 'Meine Duelle', icon: 'mdi-golf', route: '/my-matches' },
  { title: 'Freunde', icon: 'mdi-account-group', route: '/friends' },
  { title: 'Leaderboard', icon: 'mdi-trophy', route: '/leaderboard' }
]

const rules = {
  required: (value: string) => !!value || 'Nickname ist erforderlich',
  minLength: (value: string) => value.length >= 3 || 'Mindestens 3 Zeichen'
}

const isNicknameValid = computed(() => {
  return newNickname.value.length >= 3 && newNickname.value.length <= 20
})

// Methods
function updateNickname() {
  if (isNicknameValid.value) {
    userStore.updateNickname(newNickname.value)
    showEditNickname.value = false
    newNickname.value = ''
  }
}

function logout() {
  userStore.logout()
  router.push('/')
  drawer.value = false
}
</script>

