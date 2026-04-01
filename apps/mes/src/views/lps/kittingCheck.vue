<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { TabPane, Tabs } from 'ant-design-vue';

import MonthlyKitting from '#/util/component/kittingCheck/MonthlyKitting.vue';
import ThreeDayKitting from '#/util/component/kittingCheck/ThreeDayKitting.vue';

const activeTab = ref('threeDay');
</script>

<template>
  <Page>
    <Tabs v-model:active-key="activeTab">
      <TabPane key="threeDay" tab="3日齐套">
        <ThreeDayKitting />
      </TabPane>
      <TabPane key="monthly" tab="月齐套">
        <MonthlyKitting />
      </TabPane>
    </Tabs>
  </Page>
</template>

<style scoped></style>
