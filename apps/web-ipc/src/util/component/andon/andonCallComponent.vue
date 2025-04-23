<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Descriptions,
  DescriptionsItem,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from 'ant-design-vue';

/* const props = */ defineProps({
  type: {
    type: Number,
    default: 1,
  },
});
const params = ref<any>({
  // 工单编号
  workorder_code: '',
  // 设备编号
  equip_code: '',
  // 设备名称
  equip_name: '',
  // 产品名称
  product: '',
  // 物料编号
  material_code: '',
  // 呼叫人员
  create_user: '',
  // 工序
  process: '',
  // 位置
  location: '',
  // 描述
  description: '',
  // 任务来源
  source: 1,
  exigency: 1,
  andon_error: 1,
});

// region 紧急程度
const degreeOfUrgency = ref([
  { label: '一般', value: 3 },
  { label: '急', value: 2 },
  { label: '紧急', value: 1 },
]);

// endregion
// region 异常类型
const exceptionType = ref([
  { label: '物料异常', value: 4 },
  { label: '设备异常', value: 3 },
  { label: '质量异常', value: 2 },
  { label: '生产异常', value: 1 },
]);

// endregion

// region 暴露方法

const getValue = () => {
  return {
    ...params.value,
  };
};

defineExpose({
  getValue,
});

// endregion
</script>

<template>
  <Descriptions bordered :column="2">
    <!-- 工单编号 -->
    <DescriptionsItem :label="$t('andon.workOrderNumber')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.workorder_code"
          :placeholder="$t('andon.inputPrompt')"
        />
      </template>
      <template v-else>
        {{ params.workorder_code }}
      </template>
    </DescriptionsItem>
    <!-- 产品名称 -->
    <DescriptionsItem :label="$t('andon.productName')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.product"
          :placeholder="$t('andon.inputPrompt')"
        />
      </template>
      <template v-else>{{ params.product }}</template>
    </DescriptionsItem>
    <!-- 设备编号 -->
    <DescriptionsItem :label="$t('andon.equipmentNumber')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.equip_code"
          :placeholder="$t('andon.inputPrompt')"
        />
      </template>
      <template v-else>{{ params.equip_code }}</template>
    </DescriptionsItem>
    <!-- 物料编号 -->
    <DescriptionsItem :label="$t('andon.materialNumber')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.material_code"
          :placeholder="$t('andon.inputPrompt')"
        />
      </template>
      <template v-else>{{ params.material_code }}</template>
    </DescriptionsItem>
    <!-- 紧急程度 -->
    <DescriptionsItem :label="$t('andon.degreeOfUrgency')">
      <RadioGroup
        v-model:value="params.exigency"
        :options="degreeOfUrgency"
        :disabled="type === 2"
      />
    </DescriptionsItem>
    <!-- 呼叫人员 -->
    <DescriptionsItem :label="$t('andon.caller')">
      {{ params.create_user }}
    </DescriptionsItem>
    <!-- 位置 -->
    <DescriptionsItem :label="$t('andon.position')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.location"
          :placeholder="$t('andon.inputPrompt')"
        />
      </template>
      <template v-else>{{ params.location }}</template>
    </DescriptionsItem>
    <!-- 异常类型 -->
    <DescriptionsItem :label="$t('andon.exceptionType')">
      <Select
        v-model:value="params.andon_error"
        :options="exceptionType"
        :disabled="type === 2"
        class="min-w-32"
      />
    </DescriptionsItem>
    <!-- 描述 -->
    <DescriptionsItem :label="$t('andon.description')" v-if="type === 2">
      <Textarea v-model:value="params.description" :rows="4" />
    </DescriptionsItem>
  </Descriptions>
</template>

<style scoped></style>
