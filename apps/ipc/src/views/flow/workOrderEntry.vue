<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RadioGroup,
  Select,
} from 'ant-design-vue';

import { workstationListAcquisition } from '#/api';
import WorkOrderEntryTable from '#/util/component/workOrderEntryTable.vue';

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工作中心编号
  workstationCode: '',
  // 模式选择( 1手动  2自动)
  modelType: '1',
  // 产品编号
  productCode: '',
  // 工单号
  worksheetCode: '',
  // 工单派发状态
  sendState: '',
});
// 模式列表
const operationModeOptions = ref([
  {
    label: '手动',
    value: '1',
  },
  {
    label: '自动',
    value: '2',
  },
]);
// 工单派发状态  0 未开工  1已开工  3暂停下线  非必填
const theStatusOfWorkOrderDispatch = ref([
  {
    label: '未开工',
    value: '0',
  },
  {
    label: '已开工',
    value: '1',
  },
  {
    label: '暂停下线',
    value: '3',
  },
]);

// 表格对象
const workOrderEntryTableRef = ref();
/**
 * 查询
 * @param isReset 是否重置
 */
function query(isReset = false) {
  if (isReset) {
    queryParams.value = {
      // 工作中心编号
      workstationCode: '',
      // 模式选择( 1手动  2自动)
      modelType: '1',
      // 产品编号
      productCode: '',
      // 工单号
      worksheetCode: '',
      // 工单派发状态
      sendState: '',
    };
  }
  workOrderEntryTableRef.value.query();
}

// endregion

// region 工作中心查询
const listOfProductionLines = ref<any>([]);

/**
 * 查询工作站列表
 */
function queryListOfProductionLines() {
  workstationListAcquisition().then((data) => {
    listOfProductionLines.value = [];
    data.forEach((item: any) => {
      listOfProductionLines.value.push({
        value: item.workstationCode,
        label: `${item.workstationName}__${item.workstationCode}`,
      });
    });
  });
}
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

// endregion
onMounted(() => {
  queryListOfProductionLines();
});
</script>

<template>
  <Page id="page">
    <Card class="mb-5">
      <Form layout="inline" :model="queryParams">
        <!--工作中心 -->
        <FormItem :label="$t('workOrderEntry.workCenter')" class="!mb-4 w-full">
          <Select
            v-model:value="queryParams.workstationCode"
            :options="listOfProductionLines"
            :filter-option="filterOption"
            show-search
            class="mr-4 !w-full"
            @change="query(false)"
          />
        </FormItem>
        <!--模式选择 -->
        <FormItem :label="$t('workOrderEntry.modelType')" class="!mb-4 w-full">
          <RadioGroup
            :options="operationModeOptions"
            v-model:value="queryParams.modelType"
            @change="query()"
          />
        </FormItem>
        <!--产品编号 -->
        <FormItem :label="$t('workOrderEntry.productCode')">
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!--工单编号 -->
        <FormItem :label="$t('workOrderEntry.workOrderNumber')">
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!--工单状态 -->
        <FormItem :label="$t('workOrderEntry.workOrderStatus')">
          <Select
            v-model:value="queryParams.sendState"
            :options="theStatusOfWorkOrderDispatch"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="query()"
            class="mr-4"
            :disabled="!queryParams.workstationCode"
          >
            {{ $t('common.search') }}
          </Button>
          <Button @click="query(true)" :disabled="!queryParams.workstationCode">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <WorkOrderEntryTable
      ref="workOrderEntryTableRef"
      :query-params="queryParams"
      v-if="queryParams.workstationCode"
    />
  </Page>
</template>

<style scoped lang="scss"></style>
