<script setup lang="ts">
/* -------------------------------------------  Props  ------------------------------------------- */
import { computed } from 'vue';

const props = defineProps<{
  detail: any;
  editMode?: boolean;
}>();

/* -------------------------------------------  本地常量  ------------------------------------------- */
const baseApi = import.meta.env.VITE_BASE_API; // Vite 环境变量示例，与 vue-cli 的 VUE_APP_BASE_API 对应

/* -------------------------------------------  计算：iframe 高度  ------------------------------------------- */
const iframeHeight = computed(() =>
  props.editMode
    ? props.detail.style.position.h - 10
    : props.detail.style.position.h,
);
</script>

<template>
  <div
    :class="editMode ? 'modelClass' : ''"
    :style="{
      height: editMode ? `${detail.style.position.h}px` : undefined,
      backgroundColor: detail.style.backColor,
    }"
  >
    <!-- 编辑模式：内嵌模型 -->
    <iframe
      v-if="editMode"
      style="width: 100%"
      :src="detail.modelUrl"
      frameborder="0"
      :width="detail.style.position.w"
      :height="iframeHeight"
    ></iframe>
    <!-- 预览模式：展示缩略图 -->
    <img
      v-else
      :src="baseApi + detail.imageUrl"
      class="view-image"
      @dragstart.prevent
      @dragover.prevent
      @drop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.view-image {
  width: 100%;
  height: 100%;
}

.modelClass {
  padding: 5px;
  overflow: hidden;
}
</style>
