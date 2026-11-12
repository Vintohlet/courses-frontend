import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tokenStorage } from '@/api/client'
import { usersApi } from '@/api/users'
import type { AuthResponse, User } from '@/api/types'
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref(tokenStorage.get())
  const signedIn = computed(() => Boolean(token.value))
  let pending: Promise<void> | null = null
  function clear() {
    token.value = ''
    user.value = null
    tokenStorage.set('')
  }
  function accept(data: AuthResponse) {
    token.value = data.accessToken
    tokenStorage.set(data.accessToken)
    user.value = data.user
  }
  function refresh() {
    if (!signedIn.value) return Promise.resolve()
    if (!pending)
      pending = usersApi
        .me()
        .then((data) => {
          if (signedIn.value) user.value = data
        })
        .finally(() => {
          pending = null
        })
    return pending
  }
  return { user, signedIn, clear, accept, refresh }
})
