<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t } = useLocale()
</script>
<template>
  <div class="state">
    <h1>{{ t('notFound.title') }}</h1>
    <RouterLink to="/">{{ t('notFound.back') }}</RouterLink>
  </div>
</template>
