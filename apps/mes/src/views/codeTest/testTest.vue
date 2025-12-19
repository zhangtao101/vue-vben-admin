<script setup lang="ts">
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { queryIframeUrl } from '#/api';

function openWin() {
  window.open(
    `http://localhost:5556/?name=123`,
    '',
    'toolbar=no,menubar=no,resizable=yes,width=800,height=600',
  );
}
onMounted(() => {
  queryIframeUrl('SGSBKB').then((res) => {
    console.error(res);
  });
});
</script>

<template>
  <Page>
    123
    <Button type="primary" @click="openWin">打开窗口</Button>
  </Page>
</template>

<style scoped></style>
