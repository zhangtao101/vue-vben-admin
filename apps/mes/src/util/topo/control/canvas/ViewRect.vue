<script setup lang="ts">
/**
 * ViewRect.vue  Vue3 <script setup> 版
 * 圆角矩形
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
function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  type: 'fill' | 'stroke',
): void {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx[`${type}Style`] = color;
  ctx.closePath();
  ctx[type]();
}

function onResize(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  const radius = props.detail.style.radius ?? 0;
  const color = getForeColor(props.detail);
  drawRect(ctx, 4, 4, w - 8, h - 8, radius, color, 'fill');
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
