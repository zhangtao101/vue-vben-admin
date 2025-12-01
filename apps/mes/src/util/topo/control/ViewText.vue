<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';
import { useTopoAnimation } from '#/util/topo/useTopoAnimation';

/* ---------- props ---------- */
const props = defineProps<{
  detail: any;
  editMode?: boolean;
}>();

/* ---------- pinia ---------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData);

/* ---------- 动画 ---------- */
const { play, pause, show, hide } = useTopoAnimation(
  props.detail,
  props.editMode,
);

/* ---------- 本地副本 ---------- */
const text = ref(props.detail.style.text);
const classStyle = ref('view-text');

/* ---------- 数据初始化逻辑 ---------- */
function handleDataInit() {
  if (!mqttData.value) return;

  const { serialNumber, message } = mqttData.value;
  const { dataBind, dataAction, componentShow } = props.detail;

  // 数值绑定
  if (dataBind.identifier && serialNumber === dataBind.serialNumber) {
    const msg = message.find((m: any) => m.id === dataBind.identifier);
    if (msg) {
      const value = msg.value ?? 0;
      if (componentShow.includes('参数绑定')) {
        const unit = dataBind.paramUnit ?? '';
        text.value = value + unit;
      }
    }
  }

  // 动画控制
  if (
    dataAction.serialNumber &&
    dataAction.identifier &&
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
}

/* ---------- 监听 mqtt 数据 ---------- */
watch(mqttData, handleDataInit, { deep: true, immediate: true });

/* ---------- 触发首次渲染 ---------- */
const dataInit = computed(() => {
  return `${props.detail.dataBind.staticType}-${props.detail.dataBind.staticMethod}-${props.detail.dataBind.staticDate}`;
});
</script>

<template>
  <div
    :style="{
      fontSize: `${detail.style.fontSize}px`,
      fontFamily: detail.style.fontFamily,
      color: detail.style.foreColor,
      textAlign: detail.style.textAlign,
      lineHeight: `${detail.style.position.h}px`,
      border: `${detail.style.waterBorderWidth}px solid !important`,
      borderRadius: `${detail.style.borderRadius}px !important`,
      borderColor: detail.style.waterBorderColor,
      opacity: '1 !important',
    }"
    :class="classStyle"
    :id="detail.identifier"
  >
    {{ text }}
    <div v-show="false">{{ dataInit }}</div>
  </div>
</template>

<style lang="scss" scoped>
.view-text {
  width: 100%;
  height: 100%;
}
</style>
