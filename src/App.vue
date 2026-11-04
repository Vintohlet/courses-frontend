<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'

import { onMounted } from 'vue'
import { http } from './api/client'

onMounted(async () => {
  const { data } = await http.get('/health')
  console.log(data)
})
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>
