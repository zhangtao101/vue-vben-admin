<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Segmented } from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import WorkOrderDisassemblyAndConsolidation from '#/util/component/dispatchHomework/workOrderDisassemblyAndConsolidation.vue';
import WorkOrderDispatch from '#/util/component/dispatchHomework/workOrderDispatch.vue';

// region 页面下发导航
const bottomNavigation = reactive([
  '工单派工',
  '工单改派',
  '工单拆合并',
  // '流程卡打印',
]);
// 选中的导航
const checkedBottomNavigation = ref(bottomNavigation[0]);

// endregion
// 定义一个响应式变量，用于存储页面元素的宽度，默认值为 0
const elementWidth = ref(0);

// 保存窗口 resize 事件监听器引用，便于组件卸载时移除，避免内存泄漏
let resizeHandler: (() => void) | null = null;

// 更新页面元素宽度的函数
function updateElementWidth() {
  // 使用 document.querySelector('#page') 获取页面元素，并通过 offsetWidth 获取其宽度
  // 如果页面元素不存在，则返回 0
  elementWidth.value =
    (document.querySelector('#page') as any)?.offsetWidth || 0;
}

// 在组件挂载完成后执行的操作
onMounted(() => {
  updateElementWidth();

  // 添加窗口大小调整事件监听器
  // 当窗口大小发生变化时，触发 debounce 函数，延迟 500 毫秒后更新 elementWidth 的值
  resizeHandler = debounce(updateElementWidth, 500);
  window.addEventListener('resize', resizeHandler);
});

// 在组件卸载时移除 resize 监听器，避免监听器累积导致内存泄漏
onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
});
</script>

<template>
  <Page id="page">
    <WorkOrderDispatch v-if="checkedBottomNavigation === '工单派工'" />
    <WorkOrderDispatch
      :type="2"
      v-if="checkedBottomNavigation === '工单改派'"
    />
    <WorkOrderDisassemblyAndConsolidation
      v-if="checkedBottomNavigation === '工单拆合并'"
    />
    <Segmented
      v-model:value="checkedBottomNavigation"
      block
      size="large"
      :options="bottomNavigation"
      class="fixed bottom-2 w-full pr-8 shadow-2xl"
      :style="{ width: `${elementWidth}px` }"
    />
  </Page>
</template>

<style scoped lang="scss"></style>
