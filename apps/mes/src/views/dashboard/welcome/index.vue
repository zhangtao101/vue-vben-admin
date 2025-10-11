<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';
import dayjs from 'dayjs';
import gsap from 'gsap';

import { $t } from '#/locales';

const currentTime = ref(dayjs());

/**
 * 时间动画
 */
function timeUpdate() {
  // currentTime.value = dayjs();
  // requestAnimationFrame(timeUpdate);
  gsap.ticker.add(() => {
    currentTime.value = dayjs();
  });
}

onMounted(() => {
  // requestAnimationFrame(timeUpdate);
  timeUpdate();
});

onUnmounted(() => {
  gsap.ticker.remove(timeUpdate);
});
</script>

<template>
  <Page>
    <Card>
      <!-- 欢迎提示 -->
      <div class="text-4xl font-bold">
        {{ $t('authentication.welcomeTips') }}
      </div>
      <!-- 时间显示 -->
      <div class="mt-4 text-2xl font-bold">
        {{ currentTime.format('YYYY-MM-DD HH:mm:ss') }}
      </div>
    </Card>
  </Page>
</template>

<style scoped></style>
