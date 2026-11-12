<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, topicLabel, translateError } = useLocale()

import { ref, computed } from 'vue'
import { NInput, NSelect, NButton, NProgress, useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useTopicsStore } from '@/stores/topics'
import { usersApi } from '@/api/users'
import { errorText } from '@/api/client'
import AsyncState from '@/components/AsyncState.vue'
const auth = useAuthStore(),
  topics = useTopicsStore(),
  message = useMessage(),
  loading = ref(true),
  error = ref(''),
  formError = ref(''),
  topicError = ref(''),
  saving = ref(false),
  name = ref(''),
  email = ref(''),
  interests = ref<string[]>([])
const active = computed(
    () => auth.user?.courses?.filter((c) => c.course && c.status === 'active') || [],
  ),
  completed = computed(
    () => auth.user?.courses?.filter((c) => c.course && c.status === 'completed') || [],
  )
async function loadTopics() {
  try {
    topicError.value = ''
    await topics.load()
  } catch (e) {
    topicError.value = errorText(e)
  }
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    await auth.refresh()
    name.value = auth.user?.name || ''
    email.value = auth.user?.email || ''
    interests.value = [...(auth.user?.interests || [])]
  } catch (e) {
    error.value = errorText(e)
  } finally {
    loading.value = false
  }
}
async function save() {
  formError.value = ''
  if (name.value.trim().length < 2 || name.value.trim().length > 80) {
    formError.value = t('error.name')
    return
  }
  saving.value = true
  try {
    await usersApi.update({
      name: name.value.trim(),
      email: email.value.trim(),
      interests: interests.value,
    })
    await auth.refresh()
    message.success(t('profile.saved'))
  } catch (e) {
    formError.value = errorText(e)
  } finally {
    saving.value = false
  }
}
void load()
void loadTopics()
</script>
<template>
  <div class="eyebrow">{{ t('profile.account') }}</div>
  <h1>{{ t('nav.learning') }}</h1>
  <AsyncState :loading="loading" :error="error" @retry="load"
    ><div class="profile-layout">
      <aside>
        <form class="panel profile-form" @submit.prevent="save">
          <h2>{{ t('profile.title') }}</h2>
          <label
            >{{ t('form.name')
            }}<n-input
              v-model:value="name"
              :input-props="{ required: true, minlength: 2, maxlength: 80 }"
              autocomplete="name" /></label
          ><label
            >{{ t('form.email')
            }}<n-input
              v-model:value="email"
              :input-props="{ type: 'email', required: true, maxlength: 254 }"
              autocomplete="email" /></label
          ><label
            >{{ t('form.interests')
            }}<n-select
              v-model:value="interests"
              multiple
              :options="
                topics.items.map((t) => ({ label: topicLabel(t.slug, t.name), value: t.slug }))
              "
              :aria-label="t('profile.interests')"
          /></label>
          <p class="muted small">{{ t('profile.interestsHint') }}</p>
          <p v-if="topicError" class="error">
            {{ translateError(topicError) }}
            <n-button text @click="loadTopics">{{ t('profile.retryTopics') }}</n-button>
          </p>
          <p v-if="formError" class="error" role="alert">{{ translateError(formError) }}</p>
          <n-button type="primary" attr-type="submit" :loading="saving">{{
            t('profile.save')
          }}</n-button>
        </form>
      </aside>
      <div>
        <section>
          <h2>
            {{ t('profile.active') }}<span class="count">{{ active.length }}</span>
          </h2>
          <p v-if="!active.length" class="state muted">
            {{ t('profile.emptyActive') }}<RouterLink to="/">{{ t('catalog.title') }}</RouterLink>
          </p>
          <article v-for="item in active" :key="item.course!._id" class="panel my-course">
            <span class="eyebrow">{{ topicLabel(item.course?.category || '') }}</span>
            <h3>
              <RouterLink :to="'/courses/' + item.course?._id">{{ item.course?.title }}</RouterLink>
            </h3>
            <n-progress type="line" :percentage="item.progress" /><RouterLink
              :to="'/courses/' + item.course?._id + '/learn'"
              >{{ t('profile.continue') }}</RouterLink
            >
          </article>
        </section>
        <section class="section">
          <h2>
            {{ t('profile.completed') }}<span class="count">{{ completed.length }}</span>
          </h2>
          <p v-if="!completed.length" class="state muted">{{ t('profile.emptyCompleted') }}</p>
          <article v-for="item in completed" :key="item.course!._id" class="panel my-course">
            <span class="eyebrow">{{ t('learn.completed') }}</span>
            <h3>
              <RouterLink :to="'/courses/' + item.course?._id">{{ item.course?.title }}</RouterLink>
            </h3>
            <RouterLink :to="'/courses/' + item.course?._id">{{ t('profile.review') }}</RouterLink>
          </article>
        </section>
      </div>
    </div></AsyncState
  >
</template>
