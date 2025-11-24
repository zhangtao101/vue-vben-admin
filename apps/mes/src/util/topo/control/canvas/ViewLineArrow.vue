<script setup lang="ts">
/**
 * ViewLineArrow.vue  Vue3 <script setup> 版
 * 拖拽控制点 + 箭头绘制
 */
import { onMounted, ref, watch } from 'vue';

import { useCanvas } from './useCanvas';

/* ----------------------------------  props  ------------------------------------------ */
const props = defineProps<{
  detail: any;
  editMode?: boolean;
  selected?: boolean;
}>();

/* ----------------------------------  画布能力  ---------------------------------------- */
const { getForeColor } = useCanvas();

/* ----------------------------------  响应式状态  -------------------------------------- */
const elCanvas = ref<HTMLCanvasElement>();

const lineWidth = ref(2);
const flag = ref(false);
const passItem = ref<any>({});
const points = ref<any[]>([]); // 控制点

const FACTOR_H = 5; // 箭头水平倍数
const FACTOR_V = 4; // 箭头垂直倍数

/* ----------------------------------  绘制  ------------------------------------------- */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x2: number,
  y2: number,
  lw: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - lw * FACTOR_H, y2 - lw * FACTOR_V);
  ctx.lineTo(x2 - lw * FACTOR_H, y2 + lw * FACTOR_V);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D): void {
  const color = getForeColor(props.detail);
  ctx.beginPath();
  for (let i = 0; i < points.value.length - 1; i++) {
    const begin = points.value[i];
    const end = points.value[i + 1];
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
  }
  ctx.lineWidth = lineWidth.value;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function reDraw(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  drawLine(ctx);
  const tail = points.value[points.value.length - 1];
  drawArrow(ctx, tail.x, tail.y, lineWidth.value, getForeColor(props.detail));
}

function onResize(): void {
  let lw = props.detail.style.lineWidth;
  if (typeof lw !== 'number') lw = 2;
  lineWidth.value = lw;
  reDraw();
}

/* ----------------------------------  拖拽  ------------------------------------------- */
function aroowPassDown(pass: any, e: MouseEvent, _idx: number): void {
  flag.value = true;
  pass.startX = e.pageX;
  pass.startY = e.pageY;
  pass.temp = { x: pass.x, y: pass.y };
  passItem.value = pass;
}

function onMousemove(e: MouseEvent): void {
  if (!flag.value) return;
  e.cancelBubble = true;
  const dx = e.pageX - passItem.value.startX;
  const dy = e.pageY - passItem.value.startY;
  passItem.value.x = passItem.value.temp.x + dx;
  passItem.value.y = passItem.value.temp.y + dy;
  reDraw();
}

function onMouseUp(_e: MouseEvent): void {
  flag.value = false;
}

/* ----------------------------------  生命周期  ---------------------------------------- */
onMounted(() => {
  let lw = props.detail.style.lineWidth;
  if (lw === undefined) lw = 20;
  else if (typeof lw === 'string') lw = Number.parseInt(lw);
  lineWidth.value = lw;

  points.value = props.detail.style.points;
  onResize();
});

watch(() => props.detail, onResize, { deep: true });
</script>

<template>
  <div class="view-line-arrow" @mousemove="onMousemove" @mouseup="onMouseUp">
    <canvas
      ref="elCanvas"
      :width="detail.style.position.w"
      :height="detail.style.position.h"
    ></canvas>
    <template v-if="editMode && selected">
      <div
        v-for="(pass, index) in points"
        :key="index"
        class="passby"
        :style="{ left: `${pass.x - 5}px`, top: `${pass.y - 5}px` }"
        @mousedown.stop="aroowPassDown(pass, $event, index)"
      ></div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.view-line-arrow {
  position: relative;
  width: 100%;
  height: 100%;

  .passby {
    position: absolute;
    width: 15px;
    height: 15px;
    cursor: move;
    background-color: white;
    border: 1px solid rgb(34 14 223);
    border-radius: 50%;
  }
}
</style>
