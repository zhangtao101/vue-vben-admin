<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed } from 'vue';

import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  动画能力（复用 ViewSvg 逻辑）  ------------------------------------------- */
useTopoAnimation(props.detail, props.editMode);

/* -------------------------------------------  计算：SVG 地址（同 ViewSvg）  ------------------------------------------- */
const svgURL = computed(() => {
  const url = props.detail.style.url as string;
  return url === undefined || url === '' ? '' : url;
});

/* -------------------------------------------  空函数：保持外部调用兼容性  ------------------------------------------- */
// function onResize() {
//   // 无实际操作，留空保证父级调用不报错
// }
</script>

<template>
  <embed
    :src="svgURL"
    :width="detail.style.position.w"
    :height="detail.style.position.h"
    style="pointer-events: none"
    type="image/svg+xml"
    pluginspage="http://www.adobe.com/svg/viewer/install/"
  />
</template>

<style scoped>
embed {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
