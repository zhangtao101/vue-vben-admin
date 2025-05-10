<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Card, message, TabPane, Tabs } from 'ant-design-vue';

import { abnormalFilling, onLightCall } from '#/api';
import AndonCallComponent from '#/util/component/andon/andonCallComponent.vue';
import LampInstallationRecord from '#/util/component/steps/lampInstallationRecord.vue';

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
 * 多标签页数据查询
 * 功能：根据当前激活的标签页刷新对应组件数据
 * 逻辑：
 * 1. 根据 checkedType 判断当前激活的标签页
 * 2. 调用对应组件实例的 reload 方法刷新数据
 *
 * 标签类型对应关系：
 * '1' - 未认领/安灯呼叫
 * '2' - 待处理
 * '3' - 已完成
 */
function query() {
  switch (checkedType.value) {
    case '1': {
      // 安灯呼叫标签页
      unclaimedRef.value?.reload(); // 触发未认领组件刷新
      break;
    }
    case '2': {
      // 待处理标签页
      pendingProcessingRef.value?.reload(); // 触发待处理组件刷新
      break;
    }
    case '3': {
      // 已完成标签页
      completedRef.value?.reload(); // 触发已完成组件刷新
      break;
    }
    default: {
      break;
    }
  }
}

// endregion

// region 安灯呼叫
const andonCall = ref();

/**
 * 保存安灯呼叫草稿
 * 功能：获取表单数据并提交至暂存接口
 * 操作类型：
 * - 3: 暂存草稿
 * - 2: 异常填报（实际由接口参数决定）
 *
 * 步骤：
 * 1. 从表单组件获取输入数据
 * 2. 调用安灯呼叫接口提交数据
 * 3. 显示操作成功提示
 */
function saveDraft() {
  // 获取安灯呼叫组件中的表单数据
  const params = andonCall.value.getValue();

  // 调用安灯呼叫接口（包含暂存功能）
  onLightCall(params).then(() => {
    // 显示国际化成功提示
    message.success($t('common.successfulOperation'));
  });
}
/**
 * 提交异常填报数据
 * 功能：提交安灯异常信息并重置表单
 * 流程：
 * 1. 从安灯呼叫组件获取完整表单数据
 * 2. 调用异常填报接口提交数据
 * 3. 提交成功后重置表单组件状态
 *
 * 接口说明：
 * abnormalFilling - 用于触发异常处理流程或记录异常信息
 */
function submit() {
  // 获取表单组件中填写的完整数据
  const params = andonCall.value.getValue();

  // 提交到异常填报接口
  abnormalFilling(params).then(() => {
    // 显示操作成功提示（支持多语言）
    message.success($t('common.successfulOperation'));
    // 重置表单组件至初始状态
    andonCall.value.reset();
  });
}
// endregion
</script>

<template>
  <Page id="page">
    <Card>
      <Tabs :value="checkedType" @change="tabsChange" class="mb-4">
        <TabPane key="1">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 安灯呼叫 -->
            {{ $t('andon.onLightCall') }}
          </template>
          <AndonCallComponent
            ref="andonCall"
            :type="1"
            v-if="checkedType === '1'"
            :place="3"
          />

          <div class="float-right mt-4">
            <!-- 暂存 -->
            <Button type="primary" class="mr-4" @click="saveDraft()">
              {{ $t('common.temporaryStorage') }}
            </Button>
            <!-- 提交 -->
            <Button type="primary" class="mr-4" @click="submit()">
              {{ $t('common.submit') }}
            </Button>
          </div>
        </TabPane>
        <TabPane key="8">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 安灯评价 -->
            {{ $t('andon.anDengSEvaluation') }}
          </template>
          <!--      <Unclaimed
            ref="pendingProcessingRef"
            :show-type="checkedType"
            v-if="checkedType === '8'"
          />-->
          <LampInstallationRecord :state="3" v-if="checkedType === '8'" />
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped lang="scss"></style>
