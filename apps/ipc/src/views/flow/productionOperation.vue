<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { workstationGetSetRecordFlag } from '#/api';
import ProductionOperationModalOne from '#/util/component/productionOperationModalOne.vue';
import ProductionOperationModalTwo from '#/util/component/productionOperationModalTwo.vue';

const details = ref<any>({});
const ispitStop = ref(false);
let timer: null | ReturnType<typeof setInterval> = null;

function query() {
  // ispitStop 为 false 时才调用接口
  if (ispitStop.value) return;
  workstationGetSetRecordFlag().then((data) => {
    details.value = data;
  });
}

onMounted(() => {
  query();
  // 每5秒定时调用接口
  timer = setInterval(query, 2000);
});

// 监听子组件的 ispitStop 变化
function handleIspitStopChange(val: boolean) {
  ispitStop.value = val;
  if (val) {
    // ispitStop 为 true 时停止定时器
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  } else {
    // ispitStop 为 false 时重新启动定时器
    timer = setInterval(query, 2000);
  }
}

// 页面关闭时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <Page>
    <ProductionOperationModalOne v-if="details.pointType === 1" />
    <ProductionOperationModalTwo
      v-if="details.pointType === 2"
      :details="details"
      @update-ispit-stop="handleIspitStopChange"
    />
  </Page>
</template>

<style scoped lang="scss"></style>
