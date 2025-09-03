<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { queryIframeUrl } from '#/api';

const iframeUrl = ref('');
/**
 * 查询外链地址
 *
 * {
 *     "SGKB": "http://192.168.31.245:10000/sylqjjfe9l5u/",
 *     "SGSBKB": "http://192.168.31.245:10000/t5ok9bue3j2c/",
 *     "YHSY": "http://192.168.31.245:10000/07u7938hrduh/",
 *     "YHPC": "http://192.168.31.245:10000/chtto7fjddgy/",
 *     "YHZG": "http://192.168.31.245:10000/ajdgql78ai8r/",
 *     "YHSB": "http://192.168.31.245:10000/207pi025sfqa/",
 *     "FX": "http://192.168.31.245:10000/duatmugdnc81/",
 *     "FXGK": "http://192.168.31.245:10000/3icdmpqu4u7g/",
 *     "GXXJ": "http://192.168.31.245:10000/2ahm02kwe3jy/",
 *     "YHZG_FXXJ": "http://192.168.31.245:10000/ob9fh5vy51j0/"
 * }
 */
function query() {
  queryIframeUrl('YHZG_FXXJ').then((url: string) => {
    iframeUrl.value = url;
  });
}

onMounted(() => {
  query();
});
</script>

<template>
  <Page class="h-full">
    <iframe :src="iframeUrl" width="100%" height="100%"></iframe>
  </Page>
</template>

<style scoped></style>
