<script setup lang="ts">
/** ****************************************************************************************
 * ViewBizierCurveArrow.vue  Vue3 <script setup> 版
 * 依赖 useCanvas 组合式 API 获取颜色/工具函数
 */
import { onMounted, ref, watch } from 'vue';

import { useCanvas } from './useCanvas'; // 通用画布能力

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
const points = ref<any[]>([]); // 控制点（含起止）

// const FACTOR_H = 5; // 箭头水平高度倍数
// const FACTOR_V = 4; // 箭头垂直长度倍数

/* ----------------------------------  绘制逻辑  ---------------------------------------- */
function drawLine(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(points.value[0].x, points.value[0].y);
  ctx.bezierCurveTo(
    points.value[1].x,
    points.value[1].y,
    points.value[2].x,
    points.value[2].y,
    points.value[3].x,
    points.value[3].y,
  );
  ctx.lineWidth = lineWidth.value;
  ctx.strokeStyle = getForeColor(props.detail);
  ctx.stroke();
  ctx.closePath();
}

function reDraw(): void {
  const { w, h } = props.detail.style.position;
  const ctx = elCanvas.value!.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  drawLine(ctx);
}

function onResize(): void {
  let lw = props.detail.style.lineWidth;
  if (typeof lw !== 'number') lw = 2;
  lineWidth.value = lw;
  reDraw();
}

/* ----------------------------------  拖拽交互  ---------------------------------------- */
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
  points.value = props.detail.style.points;
  onResize();
});

watch(() => props.detail, onResize, { deep: true });
</script>

<template>
  <div
    class="view-bizier-curve-arrow"
    @mousemove="onMousemove"
    @mouseup="onMouseUp"
  >
    <canvas
      ref="elCanvas"
      :width="detail.style.position.w"
      :height="detail.style.position.h"
    >
      Your browser does not support the HTML5 canvas tag.
    </canvas>

    <!-- 控制点 -->
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
.view-bizier-curve-arrow {
  position: relative;
  width: 100%;
  height: 100%;

  .passby {
    position: absolute;
    width: 10px;
    height: 10px;
    cursor: move;
    background-color: white;
    border: 1px solid rgb(34 14 223);
  }
}
</style>
