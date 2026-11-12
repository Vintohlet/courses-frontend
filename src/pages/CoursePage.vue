<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, formatDate, formatNumber, topicLabel, levelLabel, translateError } = useLocale()

import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NRate, NInput, useMessage } from 'naive-ui'
import { coursesApi } from '@/api/courses'
import { ApiError, errorText } from '@/api/client'
import type { Course, Page, Review } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import CourseCard from '@/components/CourseCard.vue'
import RatingStars from '@/components/RatingStars.vue'
import AsyncState from '@/components/AsyncState.vue'
import Pagination from '@/components/Pagination.vue'
const route = useRoute(),
  router = useRouter(),
  auth = useAuthStore(),
  message = useMessage(),
  id = String(route.params.id)
const course = ref<Course>(),
  loading = ref(true),
  error = ref(''),
  similar = ref<Course[]>([]),
  similarLoading = ref(true),
  similarError = ref(''),
  reviews = ref<Page<Review>>(),
  reviewLoading = ref(true),
  reviewError = ref(''),
  reviewPage = ref(1),
  busy = ref(false),
  rating = ref(5),
  text = ref(''),
  saving = ref(false),
  formError = ref('')
const controller = new AbortController()
let reviewController: AbortController | undefined
const completed = computed(
  () =>
    course.value?.progress === 100 ||
    auth.user?.courses?.some((c) => c.course?._id === id && c.status === 'completed'),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    course.value = await coursesApi.get(id, controller.signal)
  } catch (e) {
    if (!controller.signal.aborted) error.value = errorText(e)
  } finally {
    loading.value = false
  }
}
async function loadSimilar() {
  similarLoading.value = true
  similarError.value = ''
  try {
    similar.value = await coursesApi.similar(id, controller.signal)
  } catch (e) {
    if (!controller.signal.aborted) similarError.value = errorText(e)
  } finally {
    similarLoading.value = false
  }
}
async function loadReviews(page = 1) {
  reviewController?.abort()
  const current = (reviewController = new AbortController())
  reviewPage.value = page
  reviewLoading.value = true
  reviewError.value = ''
  try {
    const data = await coursesApi.reviews(id, page, current.signal)
    if (!current.signal.aborted) {
      reviews.value = data
      const mine = data.items.find((r) => r.userId?._id === (auth.user?.id || auth.user?._id))
      if (mine) {
        rating.value = mine.rating
        text.value = mine.text || ''
      }
    }
  } catch (e) {
    if (!current.signal.aborted) reviewError.value = errorText(e)
  } finally {
    if (!current.signal.aborted) reviewLoading.value = false
  }
}
async function action() {
  if (!auth.signedIn) {
    await router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (course.value?.isEnrolled) {
    await router.push('/courses/' + id + '/learn')
    return
  }
  busy.value = true
  try {
    await coursesApi.enroll(id)
    await router.push('/courses/' + id + '/learn')
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      await load()
      message.info(translateError(e.message))
    } else message.error(translateError(errorText(e)))
  } finally {
    busy.value = false
  }
}
async function submitReview() {
  if (rating.value < 1) {
    formError.value = t('error.rating')
    return
  }
  saving.value = true
  formError.value = ''
  try {
    await coursesApi.rate(id, rating.value, text.value)
    message.success(t('course.reviewSaved'))
    await Promise.all([load(), loadReviews(1)])
  } catch (e) {
    formError.value = errorText(e)
  } finally {
    saving.value = false
  }
}
void load()
void loadSimilar()
void loadReviews()
onBeforeUnmount(() => {
  controller.abort()
  reviewController?.abort()
})
</script>
<template>
  <RouterLink to="/" class="back-link">{{ t('course.back') }}</RouterLink>
  <p v-if="route.query.notice" class="notice">{{ t('course.enrollNotice') }}</p>
  <AsyncState :loading="loading" :error="error" @retry="load"
    ><section v-if="course" class="course-detail">
      <div>
        <div class="eyebrow">
          {{ topicLabel(course.category) }} · {{ levelLabel(course.level) }}
        </div>
        <h1>{{ course.title }}</h1>
        <p class="lead">{{ course.shortDescription }}</p>
        <div class="tags">
          <span v-for="tag in course.tags" :key="tag">{{ topicLabel(tag) }}</span>
        </div>
        <div class="detail-stats">
          <RatingStars :rating="course.ratingAvg" :count="course.ratingCount" /><span
            class="muted"
            >{{ t('count.enrolled', { count: formatNumber(course.enrollCount) }) }}</span
          >
        </div>
      </div>
      <aside class="enroll-panel">
        <strong>{{
          completed
            ? t('course.completed')
            : course.isEnrolled
              ? t('course.continues')
              : t('course.ready')
        }}</strong>
        <p class="muted">{{ t('course.pace') }}</p>
        <n-button type="primary" block :loading="busy" @click="action">{{
          completed
            ? t('course.revisit')
            : course.isEnrolled
              ? t('course.continue')
              : t('course.enroll')
        }}</n-button>
      </aside>
    </section></AsyncState
  >
  <section class="section">
    <h2>{{ t('course.reviews') }}</h2>
    <form v-if="completed" class="panel review-form" @submit.prevent="submitReview">
      <h3>{{ t('course.reviewForm') }}</h3>
      <p class="muted">{{ t('course.reviewHint') }}</p>
      <n-rate v-model:value="rating" :aria-label="t('course.yourRating')" /><n-input
        v-model:value="text"
        type="textarea"
        :maxlength="2000"
        show-count
        :placeholder="t('course.reviewPlaceholder')"
        :aria-label="t('course.review')"
      />
      <p v-if="formError" role="alert" class="error">{{ translateError(formError) }}</p>
      <n-button type="primary" attr-type="submit" :loading="saving">{{
        t('course.saveReview')
      }}</n-button>
    </form>
    <p v-else class="muted">{{ t('course.reviewLocked') }}</p>
    <AsyncState
      :loading="reviewLoading"
      :error="reviewError"
      :empty="!reviews?.items.length"
      :text="t('course.noReviews')"
      @retry="loadReviews(reviewPage)"
      ><article v-for="review in reviews?.items" :key="review._id" class="review">
        <div>
          <strong>{{ review.userId?.name || t('course.learner') }}</strong
          ><time>{{ formatDate(review.createdAt) }}</time>
        </div>
        <RatingStars :rating="review.rating" />
        <p class="preserve">{{ review.text }}</p>
      </article>
      <Pagination :page="reviewPage" :pages="reviews?.pagination.pages || 0" @change="loadReviews"
    /></AsyncState>
  </section>
  <section class="section">
    <h2>{{ t('course.similar') }}</h2>
    <AsyncState
      :loading="similarLoading"
      :error="similarError"
      :empty="!similar.length"
      :text="t('course.noSimilar')"
      @retry="loadSimilar"
      ><div class="grid"><CourseCard v-for="item in similar" :key="item._id" :course="item" /></div
    ></AsyncState>
  </section>
</template>
