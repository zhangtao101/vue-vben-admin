<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import { Card, TabPane, Tabs } from 'ant-design-vue';

import Unclaimed from '#/util/component/andon/unclaimed.vue';

// region 查询数据
// 查询条件
const checkedType = ref('4');

function tabsChange(key: any) {
  checkedType.value = key;
  query();
}

const pendingProcessingRef = ref();
const completedRef = ref();
/**
 * 查询
 */
function query() {
  switch (checkedType.value) {
    case '3': {
      completedRef.value?.reload();
      break;
    }
    case '4': {
      pendingProcessingRef.value?.reload();
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
        <TabPane key="4">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待判定 -->
            {{ $t('andon.toBeDetermined') }}
          </template>
          <Unclaimed
            ref="pendingProcessingRef"
            :show-type="checkedType"
            v-if="checkedType === '4'"
          />
        </TabPane>
        <TabPane key="5">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 判定完成 -->
            {{ $t('andon.judgmentCompleted') }}
          </template>
          <Unclaimed
            ref="completedRef"
            :show-type="checkedType"
            v-if="checkedType === '5'"
          />
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped lang="scss"></style>
