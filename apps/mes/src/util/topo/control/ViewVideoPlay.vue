<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue';

import 'video.js/dist/video-js.css';

/* -------------------------------------------  Props  ------------------------------------------- */
defineProps<{
  detail: {
    imageUrl?: string;
    videoUrl: string;
  };
  editMode?: boolean;
}>();
</script>

<template>
  <!-- 直接当普通组件用 -->
  <VideoPlayer
    :src="detail.videoUrl"
    :autoplay="true"
    :muted="false"
    :loop="false"
    preload="auto"
    language="zh-CN"
    aspect-ratio="16:9"
    :fluid="true"
    not-supported-message="此视频暂无法播放，请稍后再试"
    :poster="detail.imageUrl || ''"
    class="video-player vjs-custom-skin"
  />
</template>

<style scoped>
/* 外层想占满父容器时打开 */
.video-player {
  width: 100%;
  height: 100%;
}
</style>
