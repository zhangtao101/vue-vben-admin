<script lang="ts" setup>
/**
 * 标签打印管理页面
 * 包含两个标签页：标签打印、标签查询
 * [INPUT]: 依赖 LabelPrintTab、LabelQueryTab 组件
 * [OUTPUT]: 页面容器，Tabs 切换
 * [POS]: 标签管理模块页面入口
 * [PROTOCOL]: 变更时更新此头部
 * [TIME]: 2026-06-22 13:56:00
 */
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { TabPane, Tabs } from 'ant-design-vue';

import LabelPrintTab from '#/util/component/labelPrint/LabelPrintTab.vue';
import LabelQueryTab from '#/util/component/labelPrint/LabelQueryTab.vue';

const activeTab = ref<string>('first');

function handleTabChange(key: number | string) {
  activeTab.value = String(key);
}
</script>

<template>
  <Page content-class="label-print-page">
    <Tabs v-model:active-key="activeTab" @change="handleTabChange">
      <TabPane key="first" :tab="$t('storeManagement.labelPrint.labelPrint')">
        <LabelPrintTab />
      </TabPane>
      <TabPane key="second" :tab="$t('storeManagement.labelPrint.labelQuery')">
        <LabelQueryTab />
      </TabPane>
    </Tabs>
  </Page>
</template>

<style scoped>
.label-print-page :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
