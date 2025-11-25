<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, nextTick, watch } from 'vue';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  计算：SVG 地址  ------------------------------------------- */
const svgURL = computed(() => {
  const url = props.detail.style.url as string;
  return url === undefined || url === '' ? '' : url;
});

/* -------------------------------------------  计算：最终颜色（rgba）  ------------------------------------------- */
const rgbaColor = computed(() => {
  const fc = props.detail.style.foreColor as string;
  if (!fc || fc === '') return 'grey';
  if (fc.startsWith('#')) return hex2rgba(fc);
  return fc;
});

/* -------------------------------------------  工具：hex → rgba  ------------------------------------------- */
function hex2rgba(hex: string): string {
  const arr: number[] = [];
  for (let i = 1; i < 7; i += 2) {
    arr.push(Number.parseInt(`0x${hex.slice(i, i + 2)}`, 16));
  }
  const alpha =
    hex.length === 9 ? Number.parseInt(`0x${hex.slice(7, 9)}`, 16) / 255 : 1;
  return `rgba(${arr.join(',')},${alpha})`;
}

/* -------------------------------------------  工具：射线法判断点是否在多边形内  ------------------------------------------- */
/*
function inRange(x: number, y: number, points: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const iItem = points[i];
    const jItem = points[j];
    const xi = iItem?.[0] ?? 0;
    const yi = iItem?.[1] ?? 0;
    const xj = jItem?.[0] ?? 0;
    const yj = jItem?.[1] ?? 0;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}*/

/* -------------------------------------------  监听：尺寸变化  ------------------------------------------- */
watch(
  () => props.detail,
  () => nextTick(() => window.dispatchEvent(new Event('resize'))),
  { deep: true },
);
</script>

<template>
  <div v-if="svgURL" :style="{ color: rgbaColor }" v-html="svgURL"></div>
</template>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
