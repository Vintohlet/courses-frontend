<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, topicLabel, translateError } = useLocale()

import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NInput, NSelect } from 'naive-ui'
import { usersApi } from '@/api/users'
import { errorText } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useTopicsStore } from '@/stores/topics'
import { safeRedirect } from '@/router'
const route = useRoute(),
  router = useRouter(),
  auth = useAuthStore(),
  topics = useTopicsStore(),
  register = computed(() => route.path === '/register'),
  name = ref(''),
  email = ref(''),
  password = ref(''),
  interests = ref<string[]>([]),
  busy = ref(false),
  error = ref(''),
  topicError = ref('')
async function loadTopics() {
  topicError.value = ''
  try {
    await topics.load()
  } catch (e) {
    topicError.value = errorText(e)
  }
}
void loadTopics()
async function submit() {
  error.value = ''
  const bytes = new TextEncoder().encode(password.value).length
  if (register.value && (name.value.trim().length < 2 || name.value.trim().length > 80)) {
    error.value = t('error.name')
    return
  }
  if (bytes < (register.value ? 8 : 1) || bytes > 72) {
    error.value = register.value ? t('error.registerPassword') : t('error.loginPassword')
    return
  }
  busy.value = true
  try {
    const data = register.value
      ? await usersApi.register({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value,
          interests: interests.value,
        })
      : await usersApi.login(email.value.trim(), password.value)
    auth.accept(data)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (e) {
    error.value = errorText(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="auth-layout">
    <section class="auth-intro">
      <div class="eyebrow">{{ t('auth.account') }}</div>
      <h1>{{ register ? t('auth.personal') : t('auth.welcome') }}</h1>
      <p>
        {{ register ? t('auth.registerIntro') : t('auth.loginIntro') }}
      </p>
      <div class="auth-note">
        <strong>{{ t('auth.reasons') }}</strong>
        <p>{{ t('auth.reasonsHint') }}</p>
      </div>
    </section>
    <form class="panel auth-form" @submit.prevent="submit">
      <h2>{{ register ? t('auth.createTitle') : t('auth.signIn') }}</h2>
      <p v-if="route.query.expired" class="notice">{{ t('auth.expired') }}</p>
      <label v-if="register"
        >{{ t('form.name')
        }}<n-input
          v-model:value="name"
          :input-props="{ required: true, minlength: 2, maxlength: 80 }"
          autocomplete="name"
          :placeholder="t('form.yourName')" /></label
      ><label
        >{{ t('form.email')
        }}<n-input
          v-model:value="email"
          :input-props="{ type: 'email', required: true, maxlength: 254 }"
          autocomplete="email"
          placeholder="you@example.com" /></label
      ><label
        >{{ t('form.password')
        }}<n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          :input-props="{ required: true }"
          :autocomplete="register ? 'new-password' : 'current-password'"
          :placeholder="t('form.yourPassword')" /></label
      ><template v-if="register"
        ><label
          >{{ t('form.interests')
          }}<n-select
            v-model:value="interests"
            multiple
            :options="
              topics.items.map((t) => ({ label: topicLabel(t.slug, t.name), value: t.slug }))
            "
            :placeholder="t('form.chooseTopics')"
            :aria-label="t('form.interests')"
        /></label>
        <p class="muted small">{{ t('auth.interestsHint') }}</p>
        <p v-if="topicError" class="error">
          {{ translateError(topicError) }}
          <n-button text @click="loadTopics">{{ t('common.retry') }}</n-button>
        </p>
        <p class="muted small">{{ t('auth.passwordHint') }}</p></template
      >
      <p v-if="error" role="alert" class="error">{{ translateError(error) }}</p>
      <n-button block type="primary" attr-type="submit" :loading="busy">{{
        register ? t('auth.create') : t('auth.signIn')
      }}</n-button>
      <p class="muted">
        {{ register ? t('auth.already') : t('auth.new') }}
        <RouterLink
          :to="{
            path: register ? '/login' : '/register',
            query: { redirect: route.query.redirect },
          }"
          >{{ register ? t('auth.signIn') : t('auth.create') }}</RouterLink
        >
      </p>
    </form>
  </div>
</template>
