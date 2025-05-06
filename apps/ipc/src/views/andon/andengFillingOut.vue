<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiHome } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Card, message, TabPane, Tabs } from 'ant-design-vue';

import { onLightCall } from '#/api';
import AndonCallComponent from '#/util/component/andon/andonCallComponent.vue';
import Unclaimed from '#/util/component/andon/unclaimed.vue';
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

// region 安灯呼叫
const andonCall = ref();

/**
 * 保存草稿-3 / 异常填报-2
 */
function saveDraft(place: 2 | 3) {
  const params = andonCall.value.getValue();
  params.place = place;
  onLightCall(params).then(() => {
    message.success($t('common.successfulOperation')); // 成功操作的提示信息（通过国际化处理）
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
          />

          <div class="float-right mt-4">
            <!-- 草稿箱 -->
            <Button type="primary" class="mr-4" @click="saveDraft(3)">
              {{ $t('common.toBeProcessed') }}
            </Button>
          </div>
        </TabPane>
        <TabPane key="2">
          <template #tab>
            <MdiHome class="inline-block" />
            <!-- 草稿箱 -->
            {{ $t('andon.drafts') }}
          </template>
          <Unclaimed
            ref="completedRef"
            show-type="7"
            v-if="checkedType === '2'"
          />
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
