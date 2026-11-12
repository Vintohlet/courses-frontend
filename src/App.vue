<script setup lang="ts">
import { useLocale, syncLocale } from '@/i18n'
import { computed, watch } from 'vue'
import { ruRU, enUS, dateRuRU, dateEnUS, NButtonGroup } from 'naive-ui'
const { t, locale } = useLocale()

import { NConfigProvider, NMessageProvider, NButton, type GlobalThemeOverrides } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const uiLocale = computed(() => (locale.value === 'ru' ? ruRU : enUS))
const dateLocale = computed(() => (locale.value === 'ru' ? dateRuRU : dateEnUS))
watch(locale, syncLocale, { immediate: true })
const auth = useAuthStore()
const router = useRouter()
const theme: GlobalThemeOverrides = {
  common: {
    primaryColor: '#287565',
    primaryColorHover: '#215f53',
    primaryColorPressed: '#194d43',
    borderRadius: '7px',
    fontSize: '15px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
}
function logout() {
  auth.clear()
  void router.push('/')
}
</script>
<template>
  <n-config-provider :theme-overrides="theme" :locale="uiLocale" :date-locale="dateLocale"
    ><n-message-provider
      ><header class="header">
        <div class="header-inner">
          <RouterLink to="/" class="brand">Coursework<span class="brand-dot"></span></RouterLink>
          <nav :aria-label="t('nav.main')">
            <RouterLink to="/" :class="{ selected: $route.path === '/' }">{{
              t('nav.catalog')
            }}</RouterLink
            ><RouterLink to="/recommendations" active-class="selected">{{
              t('nav.recommendations')
            }}</RouterLink>
          </nav>
          <div class="account">
            <n-button-group class="language-switch" role="group" :aria-label="t('language.label')"
              ><n-button
                v-for="language in ['ru', 'en'] as const"
                :key="language"
                size="small"
                :type="locale === language ? 'primary' : 'default'"
                :aria-pressed="locale === language"
                :aria-label="language === 'ru' ? 'Русский' : 'English'"
                @click="locale = language"
                >{{ language.toUpperCase() }}</n-button
              ></n-button-group
            >
            <template v-if="auth.signedIn"
              ><RouterLink to="/me" active-class="selected">{{ t('nav.learning') }}</RouterLink
              ><n-button size="small" quaternary @click="logout">{{
                t('auth.signOut')
              }}</n-button></template
            ><template v-else
              ><RouterLink to="/login">{{ t('auth.signIn') }}</RouterLink
              ><RouterLink to="/register" class="button-link">{{
                t('auth.create')
              }}</RouterLink></template
            >
          </div>
        </div>
      </header>
      <main class="container"><RouterView :key="$route.path" /></main>
      <footer class="footer">
        Coursework <span>{{ t('footer.pace') }}</span>
      </footer></n-message-provider
    ></n-config-provider
  >
</template>
