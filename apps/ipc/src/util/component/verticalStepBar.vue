<script setup lang="ts">
import type { PropType } from 'vue';

import { ref, watch } from 'vue';

/**
 * 左侧竖排工步组件
 * 用于纵向展示工步列表，支持选中并向父组件抛出变更事件
 */
const props = defineProps({
  // 工步列表
  steps: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  // 当前选中的工步索引
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

// 当前选中的索引
const current = ref(props.modelValue);

// 监听父组件传入的选中索引变化，保持同步
watch(
  () => props.modelValue,
  (val) => {
    current.value = val;
  },
);

/**
 * 选中某个工步
 * @param index 工步索引
 * @param item 工步数据
 */
function selectStep(index: number, item: any) {
  current.value = index;
  emit('update:modelValue', index);
  emit('change', item);
}
</script>

<template>
  <div class="flex h-full w-32 flex-col gap-2 p-4 overflow-x-hidden overflow-y-auto">
    <!-- 循环渲染每个工步 -->
    <div
      v-for="(item, index) of steps"
      :key="item.id ?? index"
      class="cursor-pointer rounded-lg border border-border bg-card p-2 text-center text-foreground shadow-sm transition-all hover:border-primary hover:bg-accent hover:shadow-md"
      :class="{
        'border-success bg-success text-success-foreground hover:border-primary hover:bg-success hover:text-success-foreground dark:border-success/60 dark:bg-success/20 dark:text-success dark:hover:bg-success/30':
          item.status === 2 || item.status === 1,
        'border-dashed border-border bg-muted text-muted-foreground hover:border-primary dark:bg-muted/70':
          item.status === -1,
        'border-destructive bg-destructive text-destructive-foreground hover:border-primary hover:bg-destructive hover:text-destructive-foreground dark:border-destructive/60 dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive/30':
          item.status === 3,
        'ring-2 ring-primary': current === index,
      }"
      @click="selectStep(index, item)"
    >
      <!-- 工步序号 -->
      <div
        class="mx-auto mb-1 flex size-6 items-center justify-center rounded-full border bg-white/85 text-xs font-semibold text-gray-700 dark:bg-white/15 dark:text-gray-100"
      >
        {{ index + 1 }}
      </div>
      <!-- 工步名称 -->
      <div class="break-words text-sm font-bold leading-snug">{{ item.title }}</div>
    </div>
  </div>
</template>

<style scoped></style>
