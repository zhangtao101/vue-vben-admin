<script setup lang="ts">
// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';

withDefaults(
  defineProps<{
    percent: number;
    title: string;
    trend?: 'down' | 'up';
    value: string;
  }>(),
  { trend: 'up' },
);

/* 新拟态 surface 变量，方便以后换肤 */
const surfaceClass = 'surface';
</script>

<template>
  <div class="card surface max-w-80 rounded-3xl p-6" :class="surfaceClass">
    <!-- 标题区 -->
    <div class="flex items-center gap-3">
      <!-- 标题 -->
      <p class="text-lg font-medium text-gray-700">{{ title }}</p>

      <!-- 趋势 -->
      <div
        class="ml-auto flex items-center gap-1 text-sm font-semibold"
        :class="trend === 'up' ? 'text-emerald-600' : 'text-rose-500'"
      >
        <span>{{ percent }}%</span>

        <Icon
          :icon="trend === 'up' ? 'mdi:arrow-up' : 'mdi:arrow-down'"
          class="inline-block size-6"
        />
        <!-- mdi:arrow-down -->
      </div>
    </div>

    <!-- 数值 -->
    <p class="mt-4 text-4xl font-bold text-gray-900">{{ value }}</p>
  </div>
</template>

<style scoped lang="scss">
/* =====  新拟态 tokens  ===== */
.surface {
  background: #e5e7eb;
  box-shadow:
    -10px -10px 20px #fff,
    10px 10px 20px rgb(153 161 175 / 40%),
    inset -10px -10px 20px rgb(209 213 220 / 30%);
}

.shadow-icon {
  box-shadow:
    -2px -2px 4px #fff,
    2px 2px 4px rgb(153 161 175 / 40%);
}

.surface-inset {
  background: #e5e7eb;
  box-shadow:
    inset -2px -2px 4px #fff,
    inset 2px 2px 4px rgb(153 161 175 / 40%);
}
</style>
