<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, translateError } = useLocale()

import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NProgress, useMessage } from 'naive-ui'
import { coursesApi } from '@/api/courses'
import { ApiError, errorText } from '@/api/client'
import type { Content, Course } from '@/api/types'
import AsyncState from '@/components/AsyncState.vue'
const id = String(useRoute().params.id),
  router = useRouter(),
  message = useMessage(),
  content = ref<Content>(),
  course = ref<Course>(),
  loading = ref(true),
  error = ref(''),
  pending = ref(''),
  controller = new AbortController()
const lessons = computed(() =>
  [...(content.value?.lessons || [])].sort((a, b) => a.order - b.order),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [data, info] = await Promise.all([
      coursesApi.content(id, controller.signal),
      coursesApi.get(id, controller.signal),
    ])
    content.value = data
    course.value = info
  } catch (e) {
    if (e instanceof ApiError && e.status === 403)
      await router.replace({ path: '/courses/' + id, query: { notice: 'enroll' } })
    else if (!controller.signal.aborted) error.value = errorText(e)
  } finally {
    loading.value = false
  }
}
async function complete(lessonId: string) {
  const data = content.value
  if (!data || pending.value || data.enrollment.completedLessons.includes(lessonId)) return
  const previous = {
    enrollment: { ...data.enrollment, completedLessons: [...data.enrollment.completedLessons] },
    progress: data.progress,
  }
  pending.value = lessonId
  data.enrollment.completedLessons.push(lessonId)
  data.progress = Math.round((data.enrollment.completedLessons.length / data.lessons.length) * 100)
  try {
    const result = await coursesApi.complete(id, lessonId)
    data.enrollment = result.enrollment
    data.progress = result.progress
  } catch (e) {
    data.enrollment = previous.enrollment
    data.progress = previous.progress
    message.error(translateError(errorText(e)))
  } finally {
    pending.value = ''
  }
}
void load()
onBeforeUnmount(() => controller.abort())
</script>
<template>
  <RouterLink :to="'/courses/' + id" class="back-link">{{ t('learn.back') }}</RouterLink
  ><AsyncState :loading="loading" :error="error" @retry="load"
    ><template v-if="content"
      ><div class="section-heading">
        <div>
          <div class="eyebrow">{{ t('learn.heading') }}</div>
          <h1>{{ course?.title || t('learn.lessons') }}</h1>
        </div>
        <span class="muted">{{
          t('count.lessons', {
            done: content.enrollment.completedLessons.length,
            total: content.lessons.length,
          })
        }}</span>
      </div>
      <div class="progress-block">
        <n-progress type="line" :percentage="content.progress" :height="8" />
        <p class="muted">{{ t('count.progress', { count: content.progress }) }}</p>
      </div>
      <div v-if="content.progress === 100 && !pending" class="completion">
        <h2>{{ t('course.completed') }}</h2>
        <p>{{ t('learn.finished') }}</p>
        <RouterLink :to="'/courses/' + id" class="button-link">{{ t('learn.review') }}</RouterLink>
      </div>
      <p class="full-description preserve">{{ content.fullDescription }}</p>
      <section>
        <article v-for="(lesson, index) in lessons" :key="lesson._id" class="lesson panel">
          <div class="lesson-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="lesson-body">
            <div class="eyebrow">
              {{
                content.enrollment.completedLessons.includes(lesson._id)
                  ? t('learn.completed')
                  : t('count.lesson', { count: index + 1 })
              }}
            </div>
            <h2>{{ lesson.title }}</h2>
            <p class="preserve">{{ lesson.description }}</p>
            <n-button
              :type="
                content.enrollment.completedLessons.includes(lesson._id) ? 'default' : 'primary'
              "
              :disabled="!!pending || content.enrollment.completedLessons.includes(lesson._id)"
              :loading="pending === lesson._id"
              @click="complete(lesson._id)"
              >{{
                content.enrollment.completedLessons.includes(lesson._id)
                  ? t('learn.lessonDone')
                  : t('learn.markDone')
              }}</n-button
            >
          </div>
        </article>
      </section></template
    ></AsyncState
  >
</template>
