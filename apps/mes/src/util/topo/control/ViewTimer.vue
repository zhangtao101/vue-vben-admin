<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import dayjs from 'dayjs';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  动画能力  ------------------------------------------- */

/* -------------------------------------------  时间显示  ------------------------------------------- */
const dateDay = ref('');
const dateYear = ref('');
const dateWeek = ref('');
let timing: null | number = null;

/* -------------------------------------------  计算：文本对齐 & 行高  ------------------------------------------- */
const textAlign = computed(() => props.detail.style.textAlign || 'center');
const lineHeight = computed(() => props.detail.style.position.h);

/* -------------------------------------------  计算：外层样式  ------------------------------------------- */
const wrapperStyle = computed(() => ({
  fontSize: `${props.detail.style.fontSize}px`,
  fontFamily: props.detail.style.fontFamily,
  color: props.detail.style.foreColor,
  textAlign: textAlign.value,
  lineHeight: `${lineHeight.value}px`,
}));

/* -------------------------------------------  点击动画  ------------------------------------------- */
function handleClick(_label: string) {
  // const domId = document.getElementById(props.detail.identifier);
  // 注释, 暂时不理解为什么要左右滑动
  // if (!domId) return;
  // switch (label) {
  //   case '旋转': {
  //     rotateAnimate(domId, 1000, true);
  //     break;
  //   }
  //   case '滑动': {
  //     const translates = [
  //       { translateX: 40 },
  //       { translateX: 80 },
  //       { translateX: 120 },
  //       { translateX: 80 },
  //       { translateX: 40 },
  //       { translateX: 0 },
  //       { translateX: -40 },
  //       { translateX: -80 },
  //       { translateX: -120 },
  //       { translateX: -80 },
  //       { translateX: -40 },
  //       { translateX: 0 },
  //     ];
  //     translateAnimate(domId, translates, 3000, true);
  //     break;
  //   }
  //   case '闪烁': {
  //     scaleAnimate(domId, 1500, true);
  //     break;
  //   }
  //   default: {
  //     getAnimate().set(domId, {
  //       translateX: () => anime.random(50, 250),
  //       rotate: () => anime.random(0, 360),
  //     });
  //   }
  // }
}

/* -------------------------------------------  时间刷新  ------------------------------------------- */
function getTimer() {
  const now = new Date();
  dateDay.value = dayjs(now).format('HH:mm:ss');
  dateYear.value = dayjs(now).format('YYYY-MM-DD');
  dateWeek.value = dayjs(now).format('dddd');
}

function startTimer() {
  getTimer();
  timing = window.setInterval(getTimer, 1000);
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  if (timing) clearInterval(timing);
});
</script>

<template>
  <div
    :id="detail.identifier"
    :style="wrapperStyle"
    @click="handleClick('滑动')"
  >
    {{ dateYear }} {{ dateWeek }} {{ dateDay }}
  </div>
</template>

<style lang="scss" scoped></style>
