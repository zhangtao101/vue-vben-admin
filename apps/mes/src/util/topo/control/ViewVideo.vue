<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import EZUIKit from 'ezuikit-js';

import videoImage from '#/assets/images/video.jpg';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  本地常量  ------------------------------------------- */
const imageUrl = ref(videoImage);

/* -------------------------------------------  计算：图片/播放器尺寸  ------------------------------------------- */
const playerSize = computed(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
}));

const playerInnerSize = computed(() => ({
  width: `${props.detail.style.position.w - 15}px`,
  height: `${props.detail.style.position.h - 15}px`,
}));

/* -------------------------------------------  初始化视频  ------------------------------------------- */
let player: any = null;

function initVideo(
  url: string,
  width: number,
  height: number,
  accessToken: string,
) {
  player = new EZUIKit.EZUIKitPlayer({
    id: 'playWind',
    width,
    height,
    template: 'pcLive',
    url,
    accessToken,
  });
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  if (props.editMode) return; // 编辑模式只显示静态图
  const url = `ezopen://open.ys7.com/${props.detail.dataBind.serialNumber}/${props.detail.dataBind.channelNumber}.live`;
  initVideo(
    url,
    Number(playerInnerSize.value.width),
    Number(playerInnerSize.value.height),
    props.detail.dataBind.accessToken,
  );
});

onBeforeUnmount(() => {
  player?.destroy();
});
</script>

<template>
  <div class="view-video">
    <el-image
      v-if="editMode"
      :style="playerSize"
      :src="imageUrl"
      @dragstart.prevent
      @dragover.prevent
      @drop.prevent
    />
    <div v-else id="playWind" :style="playerInnerSize"></div>
  </div>
</template>

<style lang="scss">
.view-video {
  width: 100%;
  height: 100%;
}
</style>
