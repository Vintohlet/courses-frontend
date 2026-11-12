<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t } = useLocale()

import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { NSelect } from 'naive-ui'
import { coursesApi } from '@/api/courses'
import { errorText } from '@/api/client'
import type { Course } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import RecommendationCard from './RecommendationCard.vue'
import AsyncState from './AsyncState.vue'
const props = defineProps<{ full?: boolean }>()
const auth = useAuthStore()
const limit = ref(6)
const items = ref<Course[]>([])
const loading = ref(true)
const error = ref('')
let controller: AbortController | undefined
const summary = computed(() => {
  const counts = { collaborative: 0, content_based: 0, popular: 0, popular_fallback: 0 }
  items.value.forEach((c) => {
    if (c.recommendation) counts[c.recommendation.strategy]++
  })
  return [
    counts.collaborative ? t('count.collaborative', { count: counts.collaborative }) : '',
    counts.content_based ? t('count.interests', { count: counts.content_based }) : '',
    counts.popular + counts.popular_fallback
      ? t('count.popular', { count: counts.popular + counts.popular_fallback })
      : '',
  ]
    .filter(Boolean)
    .join(' · ')
})
async function load() {
  controller?.abort()
  const current = (controller = new AbortController())
  loading.value = true
  error.value = ''
  try {
    const data = await coursesApi.recommendations(limit.value, current.signal)
    if (!current.signal.aborted) {
      items.value = data
      if (auth.signedIn && !auth.user) void auth.refresh().catch(() => {})
    }
  } catch (e) {
    if (!current.signal.aborted) error.value = errorText(e)
  } finally {
    if (!current.signal.aborted) loading.value = false
  }
}
watch([limit, () => auth.signedIn], load, { immediate: true })
watch(
  () => auth.user?.interests.join(','),
  (value, previous) => {
    if (previous !== undefined && value !== undefined && previous !== value) void load()
  },
)
onBeforeUnmount(() => controller?.abort())
</script>
<template>
  <section class="recommendations" :class="{ 'recommendations-preview': !full }">
    <div class="section-heading">
      <div>
        <div v-if="full" class="eyebrow">{{ t('rec.discovery') }}</div>
        <h1 v-if="full">{{ auth.signedIn ? t('rec.title') : t('rec.popular') }}</h1>
        <h2 v-else>{{ auth.signedIn ? t('rec.title') : t('rec.popular') }}</h2>
        <p class="muted">
          {{ auth.signedIn ? t('rec.hint') : t('rec.guestHint') }}
        </p>
      </div>
      <n-select
        v-if="props.full"
        v-model:value="limit"
        :aria-label="t('rec.limit')"
        class="limit-select"
        :options="
          [6, 12, 20].map((value) => ({ label: t('count.courses', { count: value }), value }))
        "
      /><RouterLink v-else to="/recommendations" class="text-link">{{
        t('rec.viewAll')
      }}</RouterLink>
    </div>
    <div v-if="full" class="explanation">
      <strong>{{ t('rec.why') }}</strong>
      <p>{{ t('rec.explanation') }}</p>
      <RouterLink v-if="!auth.signedIn" to="/login?redirect=/recommendations">{{
        t('rec.signIn')
      }}</RouterLink>
      <p v-if="!loading && !error && summary" class="summary">{{ summary }}</p>
    </div>
    <AsyncState
      :horizontal="!full"
      :loading="loading"
      :error="error"
      :empty="!items.length"
      :text="t('rec.empty')"
      @retry="load"
      ><div
        :class="full ? 'grid' : 'course-strip'"
        :tabindex="full ? undefined : 0"
        :role="full ? undefined : 'region'"
        :aria-label="auth.signedIn ? t('rec.title') : t('rec.popular')"
      >
        <RecommendationCard v-for="course in items" :key="course._id" :course="course" /></div
    ></AsyncState>
  </section>
</template>
