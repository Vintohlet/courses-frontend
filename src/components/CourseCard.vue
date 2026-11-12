<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, formatNumber, topicLabel, levelLabel } = useLocale()

import type { Course } from '@/api/types'
import RatingStars from './RatingStars.vue'
defineProps<{ course: Course }>()
</script>
<template>
  <article class="course-card">
    <div class="card-meta">
      <span>{{ topicLabel(course.category) }}</span
      ><span>{{ levelLabel(course.level) }}</span>
    </div>
    <h3>
      <RouterLink :to="'/courses/' + course._id">{{ course.title }}</RouterLink>
    </h3>
    <p class="card-description">{{ course.shortDescription }}</p>
    <div class="tags">
      <span v-for="tag in course.tags?.slice(0, 3)" :key="tag">{{ topicLabel(tag) }}</span>
    </div>
    <div class="card-bottom">
      <RatingStars :rating="course.ratingAvg" :count="course.ratingCount" /><span class="muted">{{
        t('count.enrolled', { count: formatNumber(course.enrollCount || 0) })
      }}</span>
    </div>
    <span v-if="course.isEnrolled" class="enrolled">{{ t('course.enrolled') }}</span
    ><slot />
  </article>
</template>
