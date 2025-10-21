<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';

import { listHCByCodeScan } from '#/api';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

const paramName = ref<any[]>([]);
const dataMapS = ref<any>({});

/**
 * 查询数据
 */
function queryData() {
  // 定义请求参数
  const params: any = {
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  };
  // 调用 API 查询数据
  listHCByCodeScan(params).then(({ dataMap: { dataMapList, paramNames } }) => {
    dataMapS.value = {};
    for (const item of dataMapList) {
      Object.assign(dataMapS.value, item);
    }
    paramName.value = paramNames;
  });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Descriptions bordered :column="2">
    <DescriptionsItem :label="item" v-for="item in paramName" :key="item">
      {{ dataMapS[item] }}
    </DescriptionsItem>
  </Descriptions>
</template>

<style scoped></style>
