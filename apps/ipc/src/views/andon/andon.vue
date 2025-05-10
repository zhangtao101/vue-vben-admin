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

/**
 * 标签页切换处理
 * 功能：响应标签页切换事件并刷新数据
 * 步骤：
 * 1. 更新当前激活的标签页类型
 * 2. 触发对应标签页的数据查询
 *
 * @param {string} key - 切换后的标签页标识，对应 checkedType 的取值
 */
function tabsChange(key: any) {
  checkedType.value = key; // 更新当前选中的标签页类型
  query(); // 执行对应标签页的数据查询
}

const unclaimedRef = ref();
const pendingProcessingRef = ref();
const completedRef = ref();
/**
 * 查询
 */
/**
 * 多标签页数据刷新
 * 功能：根据当前选中的标签页类型刷新对应组件数据
 * 逻辑流程：
 * 1. 根据 checkedType 判断当前激活的标签页类型
 * 2. 调用对应组件实例的 reload 方法刷新数据
 *
 * 标签类型对应关系：
 * '1' - 待领取工单
 * '2' - 待处理工单
 * '3' - 已完成工单
 */
function query() {
  switch (checkedType.value) {
    case '1': {
      // 待领取标签页
      unclaimedRef.value?.reload(); // 刷新未认领组件数据
      break;
    }
    case '2': {
      // 待处理标签页
      pendingProcessingRef.value?.reload(); // 刷新待处理组件数据
      break;
    }
    case '3': {
      // 已完成标签页
      completedRef.value?.reload(); // 刷新已完成组件数据
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
          <Unclaimed
            ref="unclaimedRef"
            :show-type="checkedType"
            v-if="checkedType === '1'"
          />
        </TabPane>
        <TabPane key="2">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 待处理 -->
            {{ $t('andon.toBeProcessed') }}
          </template>
          <Unclaimed
            ref="pendingProcessingRef"
            :show-type="checkedType"
            v-if="checkedType === '2'"
          />
        </TabPane>
        <TabPane key="3">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 已完成 -->
            {{ $t('andon.completed') }}
          </template>
          <Unclaimed
            ref="completedRef"
            :show-type="checkedType"
            v-if="checkedType === '3'"
          />
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped lang="scss"></style>
