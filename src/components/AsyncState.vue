<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, translateError } = useLocale()

import { NSkeleton, NButton } from 'naive-ui'
defineProps<{
  loading?: boolean
  error?: string
  empty?: boolean
  text?: string
  horizontal?: boolean
}>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div
    v-if="loading"
    class="grid"
    :class="{ 'course-strip': horizontal }"
    :aria-label="t('common.loading')"
    role="status"
  >
    <div v-for="i in 6" :key="i" class="course-card skeleton-card">
      <n-skeleton text width="40%" /><n-skeleton text :repeat="2" /><n-skeleton
        text
        :repeat="3"
      /><n-skeleton text width="60%" />
    </div>
  </div>
  <div v-else-if="error" class="state error" role="alert">
    <p>{{ translateError(error) }}</p>
    <n-button @click="$emit('retry')">{{ t('common.tryAgain') }}</n-button>
  </div>
  <div v-else-if="empty" class="state">
    <h3>{{ text || t('common.empty') }}</h3>
    <p class="muted">{{ t('common.emptyHint') }}</p>
  </div>
  <slot v-else />
</template>
