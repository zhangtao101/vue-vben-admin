<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Descriptions,
  DescriptionsItem,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from 'ant-design-vue';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  type: {
    type: Number,
    default: 1,
  },
});

const params = ref<any>({
  // 工单编号
  workorderCode: '',
  // 设备编号
  equipCode: '',
  // 产品名称
  product: '',
  // 物料编号
  materialCode: '',
  // 工序
  process: '',
  // 位置
  location: '',
  // 描述
  description: '',
  // 任务来源
  source: 1,
  exigency: 1,
  andonErrorType: 1,
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
const errors = ref<any>({});

function verification(key?: any) {
  const requiredParameters = key
    ? [key]
    : ['workorderCode', 'product', 'equipCode', 'materialCode'];
  let isError = false;
  requiredParameters.forEach((item) => {
    if (params.value[item]) {
      errors.value[item] = false;
    } else {
      errors.value[item] = true;
      isError = true;
    }
  });
  return isError;
}

const getValue = () => {
  return verification()
    ? false
    : {
        ...params.value,
      };
};

/**
 * 重置
 */
const reset = () => {
  params.value = {
    // 工单编号
    workorderCode: props.worksheetCode,
    // 设备编号
    equipCode: props.equipCode,
    // 产品名称
    product: '',
    // 物料编号
    materialCode: '',
    // 工序
    process: '',
    // 位置
    location: '',
    // 描述
    description: '',
    // 任务来源
    source: 1,
    exigency: 1,
    andonErrorType: 1,
  };
};

defineExpose({
  getValue,
  reset,
});

// endregion

onMounted(() => {
  if (props.worksheetCode) {
    params.value.workorderCode = props.worksheetCode;
  }
  if (props.equipCode) {
    params.value.equipCode = props.equipCode;
  }
});
</script>

<template>
  <Descriptions bordered :column="2">
    <!-- 工单编号 -->
    <DescriptionsItem :label="$t('andon.workOrderNumber')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.workorderCode"
          :placeholder="$t('andon.inputPrompt')"
          @change="verification('workorderCode')"
        />
        <span class="mt-1 block text-red-500">
          {{ errors.workorderCode ? $t('andon.error') : ' ' }}
        </span>
      </template>
      <template v-else>
        {{ params.workorderCode }}
      </template>
    </DescriptionsItem>
    <!-- 设备编号 -->
    <DescriptionsItem :label="$t('andon.equipmentNumber')">
      <template v-if="type === 1">
        <Input
          v-model:value="params.equipCode"
          :placeholder="$t('andon.inputPrompt')"
          @change="verification('equipCode')"
        />
        <span class="mt-1 block text-red-500">
          {{ errors.equipCode ? $t('andon.error') : ' ' }}
        </span>
      </template>
      <template v-else>{{ params.equipCode }}</template>
    </DescriptionsItem>
    <!-- 产品名称 -->
    <DescriptionsItem :label="$t('andon.productName')">
      <Input
        v-model:value="params.product"
        :placeholder="$t('andon.inputPrompt')"
        @change="verification('product')"
      />
      <span class="mt-1 block text-red-500">
        {{ errors.product ? $t('andon.error') : ' ' }}
      </span>
    </DescriptionsItem>
    <!-- 物料编号 -->
    <DescriptionsItem :label="$t('andon.materialNumber')">
      <Input
        v-model:value="params.materialCode"
        :placeholder="$t('andon.inputPrompt')"
        @change="verification('materialCode')"
      />
      <span class="mt-1 block text-red-500">
        {{ errors.materialCode ? $t('andon.error') : ' ' }}
      </span>
    </DescriptionsItem>
    <!-- 紧急程度 -->
    <DescriptionsItem :label="$t('andon.degreeOfUrgency')">
      <RadioGroup v-model:value="params.exigency" :options="degreeOfUrgency" />
    </DescriptionsItem>
    <!-- 位置 -->
    <DescriptionsItem :label="$t('andon.position')">
      <Input
        v-model:value="params.location"
        :placeholder="$t('andon.inputPrompt')"
      />
    </DescriptionsItem>
    <!-- 异常类型 -->
    <DescriptionsItem :label="$t('andon.exceptionType')">
      <Select
        v-model:value="params.andonErrorType"
        :options="exceptionType"
        class="min-w-32"
      />
    </DescriptionsItem>
    <!-- 描述 -->
    <DescriptionsItem :label="$t('andon.description')">
      <Textarea v-model:value="params.description" :rows="4" />
    </DescriptionsItem>
  </Descriptions>
</template>

<style scoped></style>
