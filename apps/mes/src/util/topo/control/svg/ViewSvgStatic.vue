<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onMounted, ref } from 'vue';

import { requestClient } from '#/api/request';
import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* -------------------------------------------  动画能力  ------------------------------------------- */
useTopoAnimation(props.detail, props.editMode);

/* -------------------------------------------  本地状态  ------------------------------------------- */
const svgContent = ref<string>('');

/* -------------------------------------------  计算：SVG 地址（同 ViewSvg）  ------------------------------------------- */
const svgURL = computed(() => {
  const url = props.detail.style.url as string;
  return url === undefined || url === '' ? '' : url;
});

/* -------------------------------------------  加载 SVG 源码  ------------------------------------------- */
function loadData() {
  if (!svgURL.value) return;
  requestClient
    .get(svgURL.value)
    .then((res: any) => {
      svgContent.value = res.data;
    })
    .catch(() => {
      /* 静默失败，可扩展提示 */
    });
}

/* -------------------------------------------  空函数：保持外部调用兼容性  ------------------------------------------- */
// function onResize() {
//   // 无实际操作，留空保证父级调用不报错
// }

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => loadData());
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    :width="detail.style.position.w"
    :height="detail.style.position.h"
    style="pointer-events: none"
    v-html="svgContent"
  />
</template>

<style scoped>
svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
