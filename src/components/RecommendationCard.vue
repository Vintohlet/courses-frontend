<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, topicLabel } = useLocale()

import { I18nT } from 'vue-i18n'
import type { Course } from '@/api/types'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import CourseCard from './CourseCard.vue'
const props = defineProps<{ course: Course }>()
const auth = useAuthStore()
const matched = computed(() =>
  [...new Set([props.course.category, ...(props.course.tags || [])])].filter((tag) =>
    auth.user?.interests.includes(tag),
  ),
)
</script>
<template>
  <CourseCard :course="course"
    ><div v-if="course.recommendation" class="reason">
      <span class="reason-label">{{
        course.recommendation.strategy === 'collaborative'
          ? t('rec.similarLearners')
          : course.recommendation.strategy === 'content_based'
            ? t('rec.interests')
            : t('rec.popularChoice')
      }}</span>
      <I18nT
        v-if="course.recommendation.strategy === 'collaborative'"
        keypath="rec.collaborativeReason"
        tag="p"
        scope="global"
        ><template #course
          ><RouterLink
            v-if="course.recommendation.basedOnCourse?.id"
            :to="'/courses/' + course.recommendation.basedOnCourse.id"
            >{{ course.recommendation.basedOnCourse.title || t('rec.sourceFallback') }}</RouterLink
          ><span v-else>{{ t('rec.sourceFallback') }}</span></template
        ></I18nT
      >
      <p v-else-if="course.recommendation.strategy === 'content_based'">
        {{ t('rec.matches')
        }}<span v-if="matched.length">: {{ matched.map((tag) => topicLabel(tag)).join(', ') }}</span
        >.
      </p>
      <p v-else>{{ t('rec.popularReason') }}</p>
    </div></CourseCard
  >
</template>
