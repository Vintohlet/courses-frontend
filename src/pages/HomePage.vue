<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, formatNumber, topicLabel, levelLabel, translateError } = useLocale()

import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NInput, NSelect, NButton } from 'naive-ui'
import RecommendationSection from '@/components/RecommendationSection.vue'
import CourseCard from '@/components/CourseCard.vue'
import AsyncState from '@/components/AsyncState.vue'
import Pagination from '@/components/Pagination.vue'
import { coursesApi } from '@/api/courses'
import { errorText } from '@/api/client'
import type { Course, Page } from '@/api/types'
import { useTopicsStore } from '@/stores/topics'
import { useAuthStore } from '@/stores/auth'
const route = useRoute(),
  router = useRouter(),
  topics = useTopicsStore(),
  auth = useAuthStore()
const result = ref<Page<Course>>(),
  loading = ref(true),
  error = ref(''),
  topicError = ref(''),
  search = ref('')
let timer: ReturnType<typeof setTimeout>
let controller: AbortController | undefined
function filter(key: string, value: string | number | null) {
  void router.replace({
    query: {
      ...route.query,
      [key]: value || undefined,
      page: key === 'page' ? String(value) : undefined,
    },
  })
}
function searchInput(value: string) {
  search.value = value
  clearTimeout(timer)
  timer = setTimeout(() => filter('search', value.trim().slice(0, 100)), 300)
}
async function loadTopics() {
  try {
    topicError.value = ''
    await topics.load()
  } catch (e) {
    topicError.value = errorText(e)
  }
}
async function load() {
  controller?.abort()
  const current = (controller = new AbortController())
  loading.value = true
  error.value = ''
  const query = new URLSearchParams({
    page: String(Math.max(1, Number(route.query.page) || 1)),
    limit: '12',
  })
  for (const key of ['search', 'category', 'level', 'sort', 'tags'])
    if (typeof route.query[key] === 'string') query.set(key, String(route.query[key]))
  try {
    const data = await coursesApi.list(query, current.signal)
    if (!current.signal.aborted) result.value = data
  } catch (e) {
    if (!current.signal.aborted) error.value = errorText(e)
  } finally {
    if (!current.signal.aborted) loading.value = false
  }
}
watch(
  () => route.query,
  () => {
    clearTimeout(timer)
    search.value = String(route.query.search || '')
    void load()
  },
  { immediate: true },
)
watch(() => auth.signedIn, load)
void loadTopics()
onBeforeUnmount(() => {
  clearTimeout(timer)
  controller?.abort()
})
</script>
<template>
  <RecommendationSection />
  <section class="catalog">
    <div class="section-heading">
      <div>
        <h2>{{ t('catalog.title') }}</h2>
        <p class="muted">{{ t('catalog.hint') }}</p>
      </div>
      <span v-if="result && !loading" class="muted">{{
        t('count.courses', { count: result.pagination.total })
      }}</span>
    </div>
    <div class="filters">
      <n-input
        :value="search"
        :maxlength="100"
        clearable
        :placeholder="t('catalog.search')"
        :aria-label="t('catalog.search')"
        @update:value="searchInput"
      /><n-select
        :value="String(route.query.category || '') || null"
        clearable
        :placeholder="t('catalog.categories')"
        :aria-label="t('catalog.category')"
        :options="topics.items.map((t) => ({ label: topicLabel(t.slug, t.name), value: t.slug }))"
        @update:value="filter('category', $event)"
      /><n-select
        :value="String(route.query.level || '') || null"
        clearable
        :placeholder="t('catalog.levels')"
        :aria-label="t('catalog.level')"
        :options="
          ['beginner', 'intermediate', 'advanced'].map((value) => ({
            label: levelLabel(value),
            value,
          }))
        "
        @update:value="filter('level', $event)"
      /><n-select
        :value="String(route.query.sort || 'rating')"
        :aria-label="t('catalog.sort')"
        :options="[
          { label: t('catalog.rating'), value: 'rating' },
          { label: t('catalog.popular'), value: 'popular' },
          { label: t('catalog.newest'), value: 'newest' },
        ]"
        @update:value="filter('sort', $event)"
      />
    </div>
    <p v-if="topicError" class="error">
      {{ translateError(topicError) }}
      <n-button text @click="loadTopics">{{ t('catalog.retryTopics') }}</n-button>
    </p>
    <AsyncState :loading="loading" :error="error" :empty="!result?.items.length" @retry="load"
      ><div class="grid">
        <CourseCard v-for="course in result?.items" :key="course._id" :course="course" />
      </div>
      <Pagination
        :page="Math.max(1, Number(route.query.page) || 1)"
        :pages="result?.pagination.pages || 0"
        @change="filter('page', $event)" /></AsyncState
    ><n-button v-if="!loading && !result?.items.length" @click="router.replace({ query: {} })">{{
      t('catalog.clear')
    }}</n-button>
  </section>
</template>
