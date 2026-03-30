<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Card,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  Select,
} from 'ant-design-vue';

import HistoryMatchingQuery from './historyMatchingQuery.vue';
import WorkOrderGapMatching from './workOrderGapMatching.vue';
import WorkOrderPool from './workOrderPool.vue';

// region 工单数据
const workCode = ref<any>('1');
const workshopOptions = ref<any>([
  {
    label: '机装',
    value: '1',
  },
]);
// endregion

// region 标签页切换
const activeTab = ref('pool');

const tabOptions = ref([
  { label: $t('preOperation.workOrderPool'), value: 'pool' },
  { label: $t('preOperation.workOrderGapMatching'), value: 'gap' },
  { label: $t('preOperation.historyMatchingQuery'), value: 'history' },
]);
// endregion
</script>

<template>
  <Card class="!mb-4">
    <Form layout="inline">
      <!-- 车间信息 -->
      <FormItem :label="$t('preOperation.workshopInfo')">
        <Select
          v-model:value="workCode"
          :placeholder="$t('preOperation.selectWorkshop')"
          :options="workshopOptions"
          style="width: 200px"
        />
      </FormItem>
    </Form>
  </Card>
  <RadioGroup v-model:value="activeTab" button-style="solid" class="!mb-4">
    <RadioButton
      v-for="item in tabOptions"
      :key="item.value"
      :value="item.value"
    >
      {{ item.label }}
    </RadioButton>
  </RadioGroup>
  <!-- 子组件内容 -->
  <WorkOrderPool v-if="activeTab === 'pool'" />
  <WorkOrderGapMatching v-if="activeTab === 'gap'" />
  <HistoryMatchingQuery v-if="activeTab === 'history'" />
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
