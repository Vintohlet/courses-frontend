<script setup lang="ts">
import { NPagination } from 'naive-ui'
defineProps<{ page: number; pages: number }>()
defineEmits<{ change: [page: number] }>()
</script>
<template>
  <div v-if="pages > 1" class="pagination">
    <n-pagination
      :page="page"
      :page-count="pages"
      :page-slot="5"
      @update:page="$emit('change', $event)"
    />
  </div>
</template>
