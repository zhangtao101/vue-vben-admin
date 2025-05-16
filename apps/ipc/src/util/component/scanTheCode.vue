<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button, Drawer, message } from 'ant-design-vue';

const emit = defineEmits(['scanTheCode']);
// region 扫码
// 扫码抽屉是否显示
const displayScanCode = ref(false);
// 条码扫码器实例
let codeReader: BrowserMultiFormatReader;
// 是否为http协议
const isHttp = ref(false);
// 是否为本地环境
const isLocalhost = ref(false);
// 扫到的码
const code = ref('');

// 获取 video 元素的引用
const videoInput = ref<HTMLVideoElement | null>(null);

function showQrcode() {
  // 安全验证：非本地环境的 HTTP 协议下禁止使用
  if (isHttp.value && !isLocalhost.value) {
    message.error('当前环境不安全，请切换到 HTTPS 环境以使用摄像头功能。');
    return;
  }

  // 显示扫码抽屉
  displayScanCode.value = true;

  // 延迟执行确保 DOM 更新完成
  setTimeout(() => {
    if (videoInput.value) {
      // 初始化条码阅读器
      codeReader = new BrowserMultiFormatReader();

      // 启动摄像头扫描（优先使用后置摄像头）
      codeReader.decodeFromConstraints(
        { video: { facingMode: 'environment' } }, // 使用环境-facing 摄像头
        videoInput.value,
        (res, _err) => {
          // 扫码成功处理
          if (res) {
            code.value = res.getText();
            emit('scanTheCode', code.value); // 触发扫码结果事件
            close(); // 关闭扫码界面
          }
        },
      );
    }
  }, 500); // 500ms 延迟等待 DOM 渲染完成
}

function close() {
  codeReader.reset();
  displayScanCode.value = false;
}
// endregion

// region 初始化
onMounted(() => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  isHttp.value = protocol === 'http:';
  isLocalhost.value = hostname === 'localhost' || hostname === '127.0.0.1';
});
// endregion
</script>

<template>
  <Button type="link" @click="showQrcode">
    <IconifyIcon
      icon="mdi:barcode-scan"
      class="inline-block align-middle text-xl"
    />
  </Button>

  <Drawer
    v-model:open="displayScanCode"
    height="100%"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="close()"
  >
    <p v-if="isHttp && !isLocalhost">
      当前环境不安全，请切换到 HTTPS 环境以使用摄像头功能。
    </p>
    <video ref="videoInput" class="h-full w-full" v-else></video>
  </Drawer>
</template>

<style scoped></style>
