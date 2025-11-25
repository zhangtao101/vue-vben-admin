<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';
import { useTopoAnimation } from '#/util/topo/useTopoAnimation';
// import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{
  detail: any;
  editMode?: boolean;
  selected?: boolean;
}>();

/* -------------------------------------------  Store  ------------------------------------------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* -------------------------------------------  动画能力  ------------------------------------------- */
useTopoAnimation(props.detail, props.editMode);

/* -------------------------------------------  DOM  ------------------------------------------- */
const elCanvas = ref<HTMLCanvasElement>();

/* -------------------------------------------  本地状态  ------------------------------------------- */
// const direction = ref('水平');
const lineWidth = ref(10);
const flag = ref(false);
const passItem = ref<any>({});
const points = ref('20,20 300,20');
// const width = ref(0);
// const height = ref(0);
const FACTOR_H = ref(0);
const FACTOR_V = ref(0);

/* -------------------------------------------  计算：运行标记  ------------------------------------------- */
const animations = computed(
  () => `${props.detail.style.animations}-${props.detail.style.speed}`,
);
const dashoffset = computed(
  () => props.detail.style.lineWidth + props.detail.style.lineInterval,
);

/* -------------------------------------------  计算：点位字符串  ------------------------------------------- */
const calcPoints = () => {
  const arr = (props.detail.style.spotPoints as any[]).map(
    (p) => `${p.x},${p.y}`,
  );
  points.value = arr.join(' ');
};
watch(() => props.detail.style.spotPoints, calcPoints, { deep: true });

/* -------------------------------------------  监听：动画 / 虚线偏移  ------------------------------------------- */
watch([animations, dashoffset], ([a, d]) => goggle(a, d, randomStr()));

/* -------------------------------------------  监听：mqtt 数据  ------------------------------------------- */
watch(
  mqttData,
  (newVal, oldVal) => {
    const db = props.detail.dataBind as any;
    const da = props.detail.dataAction as any;
    if (!db.paramField || newVal?.imei !== db.imei) return;

    Object.keys(newVal).forEach((key, idx) => {
      if (key !== db.paramField) return;
      if (oldVal && Object.values(newVal)[idx] === Object.values(oldVal)[idx])
        return;

      const val = Object.values(newVal)[idx] as any;
      const isGd = topoUtil.judgeSize(da.paramJudge, val, da.paramJudgeData);
      const isGd1 = topoUtil.judgeSize(
        da.paramJudge01,
        val,
        da.paramJudgeData01,
      );

      if (isGd) {
        goggle(`${da.direction}-${props.detail.style.speed}`);
      } else if (isGd1) {
        goggle(`${da.direction01}-${props.detail.style.speed}`);
      } else {
        goggle('停止-中');
      }
    });
  },
  { deep: true },
);

/* -------------------------------------------  流动动画  ------------------------------------------- */
function randomStr(): string {
  return Math.trunc((1 + Math.random()) * 0x1_00_00)
    .toString(16)
    .slice(1);
}

function goggle(newVal: string, dashoff: number = 0, random = randomStr()) {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const el: any = document.getElementById(props.detail.identifier);
  if (!el) return;
  const idSub = props.detail.identifier.slice(0, 8);
  let shineForward = '';
  let shineReverse = '';
  let isinit = true;
  if (!dashoff) {
    dashoff = props.detail.style.lineWidth + props.detail.style.lineInterval;
    isinit = false;
  }
  const [dir, speed] = newVal.split('-');
  const spdMap: Record<string, string> = {
    快: '0.15s',
    中: '0.3s',
    慢: '0.5s',
  };
  const duration = spdMap[speed!] || '0.3s';

  if (dir === '正向') {
    el.style.animation = `shine-forward-${random} ${duration} infinite linear`;
    shineForward = `@keyframes shine-forward-${random}{0%{stroke-dashoffset:${dashoff}px;}100%{stroke-dashoffset:0px;}}`;
  } else if (dir === '反向') {
    el.style.animation = `shine-reverse-${random} ${duration} infinite linear`;
    shineReverse = `@keyframes shine-reverse-${random}{0%{stroke-dashoffset:0px;}100%{stroke-dashoffset:${dashoff}px;}}`;
  } else {
    el.style.animation = 'none';
  }
  if (!random) {
    shineForward = `@keyframes shine-forward-${idSub}{0%{stroke-dashoffset:${dashoff}px;}100%{stroke-dashoffset:0px;}}`;
    shineReverse = `@keyframes shine-reverse-${idSub}{0%{stroke-dashoffset:0px;}100%{stroke-dashoffset:${dashoff}px;}}`;
  }
  if (isinit) {
    insertRule(shineForward);
    insertRule(shineReverse);
  }
}

function insertRule(keyframes: string) {
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i] as CSSStyleSheet;
    try {
      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j];
        if (rule?.cssText?.includes('svgClass')) {
          sheet.insertRule(keyframes, sheet.cssRules.length);
          break;
        }
      }
    } catch {}
  }
}

/* -------------------------------------------  Canvas 箭头  ------------------------------------------- */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x2: number,
  y2: number,
  lineWidth: number,
  color: string,
) {
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - lineWidth * FACTOR_H.value, y2 - lineWidth * FACTOR_V.value);
  ctx.lineTo(x2 - lineWidth * FACTOR_H.value, y2 + lineWidth * FACTOR_V.value);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D) {
  const lw = lineWidth.value;
  const color = props.detail.style.foreColor;
  const pts = props.detail.style.spotPoints as any[];
  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function reDraw() {
  const w = props.detail.style.position.w;
  const h = props.detail.style.position.h;
  const ctx = elCanvas.value?.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  drawLine(ctx);
  const last = (props.detail.style.spotPoints as any[]).at(-1);
  if (last)
    drawArrow(
      ctx,
      last.x,
      last.y,
      lineWidth.value,
      props.detail.style.foreColor,
    );
}

/* -------------------------------------------  拖拽控制  ------------------------------------------- */
const aroowPassDown = (pass: any, event: MouseEvent, _index: number) => {
  flag.value = true;
  pass.startX = event.pageX;
  pass.startY = event.pageY;
  pass.temp = { x: pass.x, y: pass.y };
  passItem.value = pass;
};

const onMousemove = (event: MouseEvent) => {
  if (!flag.value) return;
  event.stopPropagation();
  const dx = event.pageX - passItem.value.startX;
  const dy = event.pageY - passItem.value.startY;
  passItem.value.x = passItem.value.temp.x + dx;
  passItem.value.y = passItem.value.temp.y + dy;
  calcPoints();
  nextTick(reDraw);
};

const onMouseUp = () => (flag.value = false);

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  calcPoints();
  goggle(
    `${props.detail.style.animations}-${props.detail.style.speed}`,
    dashoffset.value,
  );
  nextTick(reDraw);
});
</script>

<template>
  <div>
    <svg class="svgBgClass">
      <polyline
        :points="points"
        :style="{
          fill: 'none',
          stroke: detail.style.backColor,
          strokeWidth: detail.style.lineHeight,
          strokeLinecap: detail.style.lineType,
          strokeLinejoin: detail.style.lineType,
          'fill-rule': detail.style.lineType,
        }"
      />
    </svg>
    <svg class="svgClass">
      <polyline
        :id="detail.identifier"
        :points="points"
        :stroke-dasharray="`${detail.style.lineWidth} ${detail.style.lineInterval}`"
        :style="{
          fill: 'none',
          stroke: detail.style.foreColor,
          strokeWidth: detail.style.lineHeight,
          strokeLinecap: detail.style.lineType,
          strokeLinejoin: detail.style.lineType,
          'fill-rule': detail.style.lineType,
        }"
      />
    </svg>
    <div class="view-line-arrow" @mousemove="onMousemove" @mouseup="onMouseUp">
      <canvas
        ref="elCanvas"
        :width="detail.style.position.w"
        :height="detail.style.position.h"
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>

      <template v-if="editMode && selected">
        <div
          v-for="(pass, index) in detail.style.spotPoints"
          :key="index"
          class="passby"
          :style="{ left: `${pass.x - 5}px`, top: `${pass.y - 5}px` }"
          @mousedown.stop="aroowPassDown(pass, $event, index)"
        ></div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.svgClass,
.svgBgClass {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shap-forward-quick {
  animation: shine-forward 0.15s infinite linear;
}

.shap-forward-medium {
  animation: shine-forward 0.3s infinite linear;
}

.shap-forward-slow {
  animation: shine-forward 0.5s infinite linear;
}

.shap-reverse-quick {
  animation: shine-reverse 0.15s infinite linear;
}

.shap-reverse-medium {
  animation: shine-reverse 0.3s infinite linear;
}

.shap-reverse-slow {
  animation: shine-reverse 0.5s infinite linear;
}

@keyframes shine-forward {
  0% {
    stroke-dashoffset: 21px;
  }

  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes shine-reverse {
  0% {
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dashoffset: 21px;
  }
}

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
