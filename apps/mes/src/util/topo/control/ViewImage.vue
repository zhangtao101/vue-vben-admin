<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useTopoStore } from '#/store';
import { getAnimate } from '#/util/topo/anime';
import topoUtil from '#/util/topo/topo_utils';
import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* ---------- props ---------- */
const props = defineProps<{
  detail: any;
  editMode?: boolean;
}>();

/* ---------- pinia ---------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* ---------- 动画 ---------- */
const { play, pause, show, hide } = useTopoAnimation(
  props.detail,
  props.editMode,
);

/* ---------- 本地副本 ---------- */
const foreColor = ref(props.detail.style.foreColor as string);
const filterClass = ref<any>({
  width: '100%',
  height: '100%',
  filter: '',
  position: 'absolute',
  animation: `${props.detail.hdClassName} 5s infinite`,
});
const animationClass = ref<any>({});

/* ---------- 1. 纯计算：返回该用哪种样式 ---------- */
const colorDesc = computed(() => {
  const fc = foreColor.value;
  const isFilter = props.detail.style.isFilter as boolean;
  if (!fc) return { type: 'none' as const };
  return isFilter
    ? { type: 'filter' as const, foreColor: fc }
    : { type: 'shadow' as const, foreColor: fc };
});

/* ---------- 2. 副作用：根据描述写样式 ---------- */
watch(
  colorDesc,
  (desc) => {
    if (desc.type === 'filter') {
      filterClass.value.marginLeft = '';
      filterClass.value.filter = `url(#${props.detail.identifier}_svg)`;
      animationClass.value = {};
    } else if (desc.type === 'shadow') {
      filterClass.value.marginLeft = '-10000px';
      filterClass.value.filter = `drop-shadow(5000px 0px ${desc.foreColor})`;
      animationClass.value = { overflow: 'hidden', position: 'relative' };
    } else {
      animationClass.value = {};
      filterClass.value.marginLeft = '';
      filterClass.value.filter = '';
    }
  },
  { immediate: true },
);

/* ---------- 计算属性 ---------- */
const imageURL = computed(() => props.detail.style.url as string);

/* ---------- 编辑模式预览动画 ---------- */
const preview = computed(() => {
  if (
    !props.editMode ||
    !props.detail.dataAction.translateList ||
    !props.detail.dataBind.hdAction
  )
    return '';

  const translates: any[] = [];
  (props.detail.dataAction.translateList as any[]).forEach((element: any) => {
    translates.push(
      element.direction === '竖直'
        ? { translateY: -element.position }
        : { translateX: element.position },
    );
  });

  const dom = document.querySelector(
    `#${props.detail.identifier}`,
  ) as HTMLElement;
  if (!dom) return '';

  getAnimate().remove(dom);
  getAnimate().translate(
    dom,
    translates,
    (props.detail.dataAction.duration as number) * 1000,
    true,
    false,
  );
  return '';
});

/* ---------- 数据初始化 ---------- */
function handleDataInit() {
  if (!mqttData.value) return;

  const { serialNumber, message } = mqttData.value as any;
  const { dataAction, dataBind } = props.detail as any;

  // 动作初始化
  if (
    dataAction.serialNumber &&
    dataAction.identifier !== null &&
    dataAction.paramJudge !== null &&
    dataAction.paramJudgeData !== undefined &&
    serialNumber === dataAction.serialNumber
  ) {
    const msg = message.find((m: any) => m.id === dataAction.identifier);
    if (msg) {
      const val = msg.value;
      const isGd = topoUtil.judgeSize(
        dataAction.paramJudge,
        val,
        dataAction.paramJudgeData,
      );
      if (isGd) {
        if (dataBind.xyAction) show();
        play();
      } else {
        if (dataBind.xyAction) hide();
        pause();
      }
    }
  }

  // 颜色初始化
  if (dataBind.identifier && serialNumber === dataBind.serialNumber) {
    const msg = message.find((m: any) => m.id === dataBind.identifier);
    if (msg) {
      const val = msg.value;
      (dataBind.stateList as any[]).forEach((element: any) => {
        const isSure = topoUtil.judgeSize(
          element.paramCondition,
          val,
          element.paramData,
        );
        if (isSure) {
          foreColor.value = element.foreColor; // 仅改副本
        }
      });
    }
  }
}

/* ---------- 监听 mqtt ---------- */
watch(mqttData, handleDataInit, { deep: true, immediate: true });

/* ---------- 辅助函数 ---------- */
function hexTofeColorMatrix(rgba: string): string {
  if (!rgba) return '';
  const hex = `#${rgba
    .match(/\d+/g)!
    .map((d: any) => (+d).toString(16).padStart(2, '0'))
    .join('')}`;
  const rgb: number[] = [
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  ];
  for (let i = 0; i < 3; i++) {
    const val = Number.parseInt(hex.slice(i * 2 + 1, 2), 16) / 255;
    rgb[i * 6] = val;
  }
  return rgb.join(' ');
}

/* ---------- 首次渲染触发 ---------- */
const dataInit = computed(() => {
  const db = props.detail.dataBind as any;
  return `${db.staticType}-${db.staticMethod}-${db.staticDate}`;
});
</script>

<template>
  <div
    class="view-image-common"
    :style="animationClass"
    :id="props.detail.identifier"
  >
    <img
      :style="[filterClass]"
      :src="`/scadaImage${imageURL}`"
      @dragstart.prevent
      @dragover.prevent
      @drop.prevent
    />
    <svg id="svg">
      <defs>
        <filter :id="`${props.detail.identifier}_svg`">
          <feColorMatrix
            color-interpolation-filters="sRGB"
            type="matrix"
            :values="hexTofeColorMatrix(foreColor)"
          />
        </filter>
      </defs>
    </svg>
    <div v-show="false">{{ dataInit }}{{ preview }}{{ colorDesc }}</div>
  </div>
</template>

<style lang="scss" scoped>
.view-image-common {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}
</style>
