<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed } from 'vue';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  计算：iframe 地址（不赋值 props）  ------------------------------------------- */
const childUrl = computed(() => {
  const ztPageData = props.detail.dataBind.ztPageData as string;
  if (!ztPageData) return '';
  const [id, guid] = ztPageData.split('&');
  return `${window.location.origin}/topo/fullscreen?id=${id}&guid=${guid}&t=${Date.now()}`;
});

/* -------------------------------------------  计算：外层动态样式  ------------------------------------------- */
const wrapperStyle = computed<any>(() => ({
  fontSize: `${props.detail.style.fontSize}px`,
  fontFamily: props.detail.style.fontFamily,
  color: props.detail.style.foreColor,
  textAlign: props.detail.style.textAlign,
  border: `${props.detail.style.waterBorderWidth}px solid`,
  borderRadius: `${props.detail.style.borderRadius}px`,
  borderColor: props.detail.style.waterBorderColor,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const iframeStyle = computed(() => ({
  width: `${props.detail.style.position.w - 20}px`,
  height: `${props.detail.style.position.h - 20}px`,
  border: 'transparent',
}));
</script>

<template>
  <div :style="wrapperStyle">
    <iframe v-if="childUrl" :style="iframeStyle" :src="childUrl"></iframe>
    <div v-show="false">{{ childUrl }}</div>
  </div>
</template>

<style lang="scss" scoped></style>
