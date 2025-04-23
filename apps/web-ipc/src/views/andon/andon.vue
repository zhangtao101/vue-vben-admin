<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import { Card, TabPane, Tabs } from 'ant-design-vue';

import Unclaimed from '#/util/component/andon/unclaimed.vue';

// region 查询数据
// 查询条件
const checkedType = ref('1');

function tabsChange(key: any) {
  checkedType.value = key;
  query();
}

const unclaimedRef = ref();
const pendingProcessingRef = ref();
const completedRef = ref();
/**
 * 查询
 */
function query() {
  switch (checkedType.value) {
    case '1': {
      unclaimedRef.value?.reload();
      break;
    }
    case '2': {
      pendingProcessingRef.value?.reload();
      break;
    }
    case '3': {
      completedRef.value?.reload();
      break;
    }
    default: {
      break;
    }
  }
}

// endregion

// endregion
</script>

<template>
  <Page id="page">
    <Card>
      <Tabs :value="checkedType" @change="tabsChange" class="mb-4">
        <TabPane key="1">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待领取 -->
            {{ $t('andon.waitingToBeClaimed') }}
          </template>
          <Unclaimed ref="unclaimedRef" :show-type="checkedType" />
        </TabPane>
        <TabPane key="2">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待处理 -->
            {{ $t('andon.toBeProcessed') }}
          </template>
          <Unclaimed ref="pendingProcessingRef" :show-type="checkedType" />
        </TabPane>
        <TabPane key="3">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 已完成 -->
            {{ $t('andon.completed') }}
          </template>
          <Unclaimed ref="completedRef" :show-type="checkedType" />
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped lang="scss"></style>
