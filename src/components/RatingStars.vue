<script setup lang="ts">
import { useLocale } from '@/i18n'
const { t, locale, formatNumber } = useLocale()

defineProps<{ rating: number; count?: number }>()
</script>
<template>
  <span class="rating"
    ><span aria-hidden="true" class="stars">★</span>
    <strong>{{
      new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(rating || 0)
    }}</strong
    ><span v-if="count !== undefined" class="muted">
      ({{ t('count.ratings', { count: formatNumber(count) }) }})</span
    ></span
  >
</template>
