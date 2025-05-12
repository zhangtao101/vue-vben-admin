<script setup lang="ts">
import { ref } from 'vue';
// eslint-disable-next-line n/no-extraneous-import
import { QrcodeStream } from 'vue-qrcode-reader';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Drawer, Tooltip } from 'ant-design-vue';

// region 扫码

const displayScanCode = ref(false);

// const codeTypes = ['code_39', 'code_93', 'code_128', 'qr_code'];

function showQrcode() {
  displayScanCode.value = true;
}

function onDecode(_val: any) {
  // console.log(val, 6666);
}
// endregion

// region 暴露方法
defineExpose({
  showQrcode,
});
// endregion
</script>

<template>
  <Tooltip :title="$t('common.scanTheCode')">
    <Button type="link" @click="showQrcode">
      <IconifyIcon
        icon="mdi:barcode-scan"
        class="inline-block align-middle text-xl"
      />
    </Button>
  </Tooltip>

  <Drawer
    v-model:open="displayScanCode"
    :height="500"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
  >
    <QrcodeStream
      v-if="displayScanCode"
      @detect="onDecode"
      :formats="['code_39', 'code_93', 'code_128', 'qr_code']"
    />
  </Drawer>
</template>

<style scoped></style>
