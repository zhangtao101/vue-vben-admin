<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, Select } from 'ant-design-vue';

import { workstationListAcquisition } from '#/api';
import ScanTheCode from '#/util/component/scanTheCode.vue';
import WorkOrderEntryTable from '#/util/component/workOrderEntryTable.vue';

// region 查询数据
// 定义查询参数
const queryParams = ref({
  // 工作中心编号
  workstationCode: '',
  // 产品编号
  productCode: '',
  // 工单号
  worksheetCode: '',
  // 工单派发状态
  sendState: '',
});

// 定义工单派发状态选项
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

// 定义表格组件引用
const workOrderEntryTableRef = ref();

/**
 * 执行查询操作
 * @param isReset 是否重置查询条件
 */
function query(isReset = false) {
  if (isReset) {
    queryParams.value = {
      workstationCode: '',
      productCode: '',
      worksheetCode: '',
      sendState: '',
    };
  }
  setTimeout(() => {
    workOrderEntryTableRef.value?.query();
  }, 100);
}
// endregion

// region 工作中心查询
// 定义生产线列表
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

/**
 * 筛选选项
 * @param input 输入值
 * @param option 选项
 * @returns 是否匹配
 */
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

// 组件挂载时执行
onMounted(() => {
  queryListOfProductionLines();
});
// endregion
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
            class="mr-4 !w-[80%]"
            @change="query(false)"
          />
          <ScanTheCode
            @scan-the-code="
              (val) => {
                queryParams.workstationCode = val;
                query(false);
              }
            "
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
