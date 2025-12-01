<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue';

import * as mpegts from 'mpegts.js'; // ① 引入

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  播放器实例  ------------------------------------------- */
let player: any | null = null;

/* -------------------------------------------  计算：视频尺寸  ------------------------------------------- */
const videoStyle = computed(() => ({
  width: `${props.detail.style.position.w}px`,
  height: `${props.detail.style.position.h}px`,
  backgroundColor: 'black',
}));

/* -------------------------------------------  初始化 & 播放  ------------------------------------------- */
function initPlayer() {
  if (!(mpegts as any).getFeatureList().mseLivePlayback) return; // ② 能力检测

  // eslint-disable-next-line unicorn/prefer-query-selector
  const videoEl = document.getElementById(
    props.detail.identifier,
  ) as HTMLVideoElement;
  if (!videoEl) return;

  player = (mpegts as any).createPlayer({
    // ③ 创建实例
    type: 'flv', // 直播常用 m2ts，也可 flv
    isLive: true,
    hasAudio: false,
    url: props.detail.videoUrl as string,
  });

  player.attachMediaElement(videoEl);
  player.load(); // ④ 加载
  player.play(); // ⑤ 播放
}

// function play() {
//   player?.play();
// }

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  nextTick(initPlayer);
});

onBeforeUnmount(() => {
  if (player) {
    player.pause();
    player.unload();
    player.destroy();
    player = null;
  }
});
</script>

<template>
  <div class="view-video-mp4">
    <video
      :id="detail.identifier"
      controls
      autoplay
      muted
      :style="videoStyle"
    ></video>
  </div>
</template>

<style lang="scss">
.view-video-mp4 {
  width: 100%;
  height: 100%;
}
</style>
