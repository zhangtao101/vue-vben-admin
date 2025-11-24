<script setup lang="ts">
/**
 * ViewTriangle.vue  Vue3 <script setup> 版
 * 等腰三角形
 */
import { onMounted, ref, watch } from 'vue';

import { useCanvas } from './useCanvas';

/* ----------------------------------  props  ------------------------------------------ */
const props = defineProps<{ detail: any }>();

/* ----------------------------------  画布能力  ---------------------------------------- */
const { getForeColor } = useCanvas();

/* ----------------------------------  响应式状态  -------------------------------------- */
const elCanvas = ref<HTMLCanvasElement>();

/* ----------------------------------  绘制逻辑  ---------------------------------------- */
function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: string,
  type: 'fill' | 'stroke',
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx[`${type}Style`] = color;
  ctx.closePath();
  ctx[type]();
}

function onResize(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  const x1 = w / 2;
  const y1 = 0;
  const x2 = 0;
  const y2 = h;
  const x3 = w;
  const y3 = h;
  const color = getForeColor(props.detail);

  drawTriangle(x1, y1, x2, y2, x3, y3, color, 'fill');
}

/* ----------------------------------  生命周期  ---------------------------------------- */
onMounted(onResize);
watch(() => props.detail, onResize, { deep: true });
</script>

<template>
  <canvas
    ref="elCanvas"
    :width="detail.style.position.w"
    :height="detail.style.position.h"
  >
    Your browser does not support the HTML5 canvas tag.
  </canvas>
</template>

<style scoped lang="scss">
/* 按需补充 */
</style>
