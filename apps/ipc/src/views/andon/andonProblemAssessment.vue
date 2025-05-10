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

/**
 * 标签页切换事件处理
 * 功能：更新当前激活的标签页并刷新对应数据
 * 步骤：
 * 1. 接收标签页切换的key值
 * 2. 更新当前选中标签页状态
 * 3. 触发对应标签页的数据查询
 *
 * @param {string} key - 切换后的标签页标识（4-待判定，5-判定完成）
 */
function tabsChange(key: any) {
  checkedType.value = key; // 更新当前激活的标签页状态
  query(); // 执行对应标签页的数据查询
}

const pendingProcessingRef = ref();
const completedRef = ref();

/**
 * 多标签页数据刷新
 * 功能：根据当前激活的标签页类型刷新对应组件数据
 * 逻辑流程：
 * 1. 根据 checkedType 判断当前激活的标签页类型
 * 2. 调用对应组件实例的 reload 方法刷新数据
 *
 * 标签类型对应关系：
 * '4' - 待判定问题
 * '5' - 已判定完成
 */
function query() {
  switch (checkedType.value) {
    case '4': {
      // 待判定标签页
      pendingProcessingRef.value?.reload(); // 刷新待判定组件数据
      break;
    }
    case '5': {
      // 判定完成标签页
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
