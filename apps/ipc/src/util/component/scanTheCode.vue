<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button, Drawer, message } from 'ant-design-vue';

/**
 * 定义事件发射器，用于触发 'scanTheCode' 事件，将扫码结果传递给父组件
 */
const emit = defineEmits(['scanTheCode']);
// region 扫码
/**
 * 控制扫码抽屉是否显示的响应式变量
 */
const displayScanCode = ref(false);
/**
 * 条码扫码器实例，用于调用扫码功能
 */
let codeReader: BrowserMultiFormatReader;
/**
 * 响应式变量，用于判断当前页面是否使用 http 协议
 */
const isHttp = ref(false);
/**
 * 响应式变量，用于判断当前是否为本地环境
 */
const isLocalhost = ref(false);
/**
 * 响应式变量，用于存储扫描到的条码内容
 */
const code = ref('');

/**
 * 获取 video 元素的引用，用于显示摄像头画面
 */
const videoInput = ref<HTMLVideoElement | null>(null);

/**
 * 显示扫码界面并启动扫码功能
 * 此函数会先检查当前环境是否安全，若不安全则提示用户切换到 HTTPS 环境。
 * 若环境安全，则显示扫码抽屉，并初始化条码阅读器，启动摄像头进行扫码。
 */
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

/**
 * 关闭扫码界面并重置扫码器
 * 此函数会调用扫码器的 reset 方法重置扫码器，并隐藏扫码抽屉。
 */
function close() {
  codeReader.reset();
  displayScanCode.value = false;
}
// endregion

// region 初始化
/**
 * 组件挂载时的生命周期钩子函数
 * 此函数会在组件挂载完成后获取当前页面的协议和主机名，
 * 并根据这些信息判断当前是否使用 http 协议以及是否为本地环境。
 */
onMounted(() => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  isHttp.value = protocol === 'http:';
  isLocalhost.value = hostname === 'localhost' || hostname === '127.0.0.1';
});
// endregion
</script>

<template>
  <!-- 点击此按钮触发 showQrcode 函数，显示扫码界面 -->
  <Button type="link" @click="showQrcode">
    <!-- 显示条码扫描图标 -->
    <IconifyIcon
      icon="mdi:barcode-scan"
      class="inline-block align-middle text-xl"
    />
  </Button>

  <!-- 扫码抽屉组件，根据 displayScanCode 的值控制显示状态 -->
  <Drawer
    v-model:open="displayScanCode"
    height="100%"
    placement="top"
    :title="$t('dispatchHomework.sentOut')"
    @close="close()"
  >
    <!-- 若当前环境不安全，显示提示信息 -->
    <p v-if="isHttp && !isLocalhost">
      当前环境不安全，请切换到 HTTPS 环境以使用摄像头功能。
    </p>
    <!-- 若环境安全，显示 video 元素用于显示摄像头画面 -->
    <video ref="videoInput" class="h-full w-full" v-else></video>
  </Drawer>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
