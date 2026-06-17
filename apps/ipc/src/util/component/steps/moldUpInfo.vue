<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Descriptions, DescriptionsItem, Spin } from 'ant-design-vue';

import { listByMode } from '#/api';

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
});

const loading = ref(false);
const detailData = ref<any>({});

/**
 * 查询模具上模信息
 */
function queryData() {
  loading.value = true;
  const params: any = {
    workstationCode: props.workstationCode,
    functionId: props.functionId,
    bindingId: props.bindingId,
    worksheetCode: props.worksheetCode,
  };
  listByMode(params)
    .then((res: any) => {
      detailData.value = res || {};
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="loading">
    <Descriptions bordered :column="2">
      <DescriptionsItem label="设备编号">
        {{ detailData.equipmentCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="设备名称">
        {{ detailData.equipmentName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="模具编号">
        {{ detailData.moldCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="模具名称">
        {{ detailData.moldName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="工单号">
        {{ detailData.workOrderNo || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="当前状态">
        {{ detailData.currentStatusName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="上模时间" :span="2">
        {{ detailData.installTime || '-' }}
      </DescriptionsItem>
    </Descriptions>
  </Spin>
</template>

<style scoped></style>
