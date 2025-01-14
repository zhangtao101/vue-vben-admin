<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { useAccessStore } from '@vben/stores';

defineOptions({ name: 'EmptyLayout' });

const { query } = useRoute();
const accessStore = useAccessStore();

onMounted(() => {
  if (query.authorization) {
    // 将 accessToken 存储到 accessStore 中
    accessStore.setAccessToken(query.authorization as string);
    accessStore.setRefreshToken(query.authorization as string);
  }
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
