import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@/api/users'
export const useTopicsStore = defineStore('topics', () => {
  const items = ref<import('@/api/types').Topic[]>([])
  let pending: Promise<void> | null = null
  function load() {
    if (items.value.length) return Promise.resolve()
    if (!pending)
      pending = usersApi
        .topics()
        .then((data) => {
          items.value = data
        })
        .finally(() => {
          pending = null
        })
    return pending
  }
  return { items, load }
})
