<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { requestClient } from '#/api/request'; // ← 按你要求替换

/* ---------- props ---------- */
const props = defineProps<{ detail: any }>();

/* ---------- 路由 ---------- */
const route = useRoute();

/* ---------- 本地副本 ---------- */
const text = ref(props.detail.style.text); // 脱离 props 独立维护

/* ---------- 轮询定时器 ---------- */
let timer: null | number = null;

/* ---------- 核心方法（纯 .then） ---------- */
function getDeviceStatistic() {
  const { paramName, staticMethod, staticDate, staticType } =
    props.detail.dataBind;
  const url = '/prod-api/ghxx/bDeviceManager/getDeviceStatistic';

  let params: any = null;
  if (paramName && staticMethod) {
    params = {
      queryType: staticMethod,
      ztGuid: route.query.guid,
      paramNames: paramName,
      queryDate: staticDate,
    };
  } else {
    params = staticType ? { queryType: staticType } : null;
  }

  if (!params) return;

  requestClient
    .get(url, { params })
    .then((res: any) => {
      text.value = res.data?.returnCount ?? 0; // 只改副本
    })
    .catch(() => {
      text.value = 0;
    });
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  nextTick(getDeviceStatistic);
  timer = window.setInterval(getDeviceStatistic, 60_000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  timer = null;
});

/* ---------- 触发首次渲染 ---------- */
const dataInit = `${props.detail.dataBind.staticType}-${props.detail.dataBind.staticMethod}-${props.detail.dataBind.staticDate}`;
</script>

<template>
  <div
    :style="{
      fontSize: `${detail.style.fontSize}px`,
      fontFamily: detail.style.fontFamily,
      color: detail.style.foreColor,
      textAlign: detail.style.textAlign,
      border: `${detail.style.waterBorderWidth}px solid !important`,
      borderRadius: `${detail.style.borderRadius}px !important`,
      borderColor: detail.style.waterBorderColor,
    }"
  >
    {{ text }}
    <div v-show="false">{{ dataInit }}</div>
  </div>
</template>

<style lang="scss" scoped></style>
