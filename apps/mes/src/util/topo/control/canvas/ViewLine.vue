<script setup lang="ts">
/**
 * ViewLine.vue  Vue3 <script setup> 版
 * 使用 useCanvas 获取统一颜色
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
function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function onResize(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  let [x1, y1, x2, y2] = [0, h / 2, w, h / 2];
  if (props.detail.direction === 'vertical') {
    x1 = w / 2;
    x2 = w / 2;
    y1 = 0;
    y2 = h;
  }

  let lineWidth: number = props.detail.style.lineWidth;
  if (typeof lineWidth !== 'number') lineWidth = 2;

  drawLine(ctx, x1, y1, x2, y2, lineWidth, getForeColor(props.detail));
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
