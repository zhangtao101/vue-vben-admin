<script setup lang="ts">
/**
 * ViewLineWave.vue  Vue3 <script setup> 版
 * 正弦波浪线
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
  width: number,
  height: number,
  lineWidth: number,
  color: string,
): void {
  const len = Math.hypot(width, height);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const amplitude = 5; // 振幅
  const frequency = 5; // 频率
  for (let x = 0; x < len; x += 1) {
    const y = amplitude * Math.sin(x / frequency);
    ctx.lineTo(x, y);
  }
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function onResize(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  let lineWidth: number = props.detail.style.lineWidth;
  if (typeof lineWidth !== 'number') lineWidth = 2;

  drawLine(ctx, w, h, lineWidth, getForeColor(props.detail));
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
