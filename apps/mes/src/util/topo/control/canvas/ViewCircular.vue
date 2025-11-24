<script setup lang="ts">
/** ****************************************************************************************
 * ViewCircular.vue  Vue3 <script setup> 版
 * 依赖 useCanvas 组合式 API 获取颜色
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
function drawCircular(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  start: number,
  end: number,
  color: string,
  type: 'fill' | 'stroke',
): void {
  const unit = Math.PI / 180;
  ctx.beginPath();
  ctx.arc(x, y, r, start * unit, end * unit);
  ctx[`${type}Style`] = color;
  ctx.closePath();
  ctx[type]();
}

function onResize(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  const x = w / 2;
  const y = h / 2;
  const r = Math.min(w / 2, h / 2) - 2;
  const color = getForeColor(props.detail);

  drawCircular(ctx, x, y, r, 0, 360, color, 'fill');
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
/* 如需样式可在此补充 */
</style>
