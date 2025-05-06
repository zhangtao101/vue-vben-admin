<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Segmented } from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { debounce } from 'lodash-es';

import WorkOrderDispatch from '#/util/component/dispatchHomework/workOrderDispatch.vue';

// region 页面下发导航
const bottomNavigation = reactive([
  '工单派工',
  '工单改派',
  /* '工单拆合并',
  '流程卡打印',*/
]);
// 选中的导航
const checkedBottomNavigation = ref(bottomNavigation[0]);

// endregion
const elementWidth = ref(0);
onMounted(() => {
  elementWidth.value =
    (document.querySelector('#page') as any)?.offsetWidth || 0;
  window.addEventListener(
    'resize',
    debounce(() => {
      elementWidth.value =
        (document.querySelector('#page') as any)?.offsetWidth || 0;
    }, 500),
  );
});
</script>

<template>
  <Page id="page">
    <WorkOrderDispatch v-if="checkedBottomNavigation === '工单派工'" />
    <WorkOrderDispatch
      :type="2"
      v-if="checkedBottomNavigation === '工单改派'"
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
