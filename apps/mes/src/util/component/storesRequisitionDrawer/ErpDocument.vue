<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Checkbox, CheckboxGroup, DatePicker, Drawer, Form, FormItem, Input, message, RadioGroup, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchERPList } from '#/api';
import {
  MATERIAL_REQUISITION_STATUS_TYPE,
  TYPE_OF_MATERIAL_REQUISITION_PROGRESS,
} from '#/util';

defineOptions({
  name: 'ErpDocument',
});

const show = ref(false);
const queryParams = ref<any>({
  progress: [],
  complete: '2',
});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'isFinish', slots: { default: 'selectedState' }, title: $t('storesRequisition.complete'), minWidth: 50 },
    { field: 'isSuspend', slots: { default: 'selectedState' }, title: $t('storesRequisition.suspend'), minWidth: 50 },
    { field: 'isSign', slots: { default: 'selectedState' }, title: $t('storesRequisition.issue'), minWidth: 50 },
    { field: 'isLock', slots: { default: 'selectedState' }, title: $t('storesRequisition.lock'), minWidth: 50 },
    { field: 'applyCode', title: $t('storesRequisition.applicationNumber'), minWidth: 120 },
    { type: 'seq', title: $t('page.common.serialNumber'), width: 60 },
    { field: 'applyDate', title: $t('storesRequisition.applicationDate'), minWidth: 100 },
    { field: 'requireDate', title: $t('storesRequisition.demandDate'), minWidth: 100 },
    { field: 'applyType', title: $t('storesRequisition.categoryOfApplication'), minWidth: 100 },
    { field: 'productName', title: $t('storesRequisition.productName'), minWidth: 200 },
    { field: 'materialCode', title: $t('storesRequisition.materialNumber'), minWidth: 120 },
    { field: 'materialName', title: $t('storesRequisition.materialName'), minWidth: 200 },
    { field: 'unit', title: $t('storeManagement.labelPrint.unit'), minWidth: 80 },
    { field: 'applyNumber', title: $t('storesRequisition.applyQty'), minWidth: 100 },
    { field: 'receiveNumber', title: $t('storesRequisition.actualDeliveredQty'), minWidth: 100 },
    { field: 'unclaimedQuantity', title: $t('storesRequisition.unclaimedQty'), minWidth: 100 },
    { field: 'remark', title: $t('storesRequisition.remark'), minWidth: 200 },
    { field: 'planCode', title: $t('storesRequisition.planCode'), minWidth: 120 },
    { field: 'customerContractCode', title: $t('storesRequisition.customerContractCode'), minWidth: 150 },
    { field: 'username', title: $t('storesRequisition.owningUser'), minWidth: 120 },
    { field: 'applyOrgName', title: $t('storesRequisition.applicationDepartment'), minWidth: 150 },
    { field: 'applyClassName', title: $t('storesRequisition.applyClass'), minWidth: 120 },
    { field: 'dutyOrgName', title: $t('storesRequisition.responsibleDepartment'), minWidth: 150 },
  ],
  height: 400,
  stripe: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryERPData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询 ERP 单据数据
 */
function queryERPData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    if (params.applyDate) {
      params.applyDate = params.applyDate.format('YYYY-MM-DD');
    }
    fetchERPList(params)
      .then(({ total, results }: any) => {
        results.forEach((item: any) => {
          item.unclaimedQuantity = item.applyNumber - item.receiveNumber;
        });
        resolve({ total, items: results });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

// 查询
function handleSearch() {
  gridApi.reload();
}

// 打开
function open() {
  queryParams.value = { progress: [], complete: '2' };
  show.value = true;
  gridApi.reload();
}

// 关闭
function handleClose() {
  show.value = false;
}

// 打印（暂未完成）
function handlePrint() {
  message.info($t('storesRequisition.printFeatureNotCompleted'));
}

defineExpose({ open });
</script>

<template>
  <!-- ERP单据抽屉 -->
  <Drawer
    v-model:open="show"
    :title="$t('storesRequisition.erpDocument')"
    :destroy-on-close="true"
    :footer-style="{ textAlign: 'right' }"
    width="90%"
    @close="handleClose"
  >
    <!-- region 搜索 -->
    <Form layout="inline" :model="queryParams">
      <!-- 申请编号 -->
      <FormItem
        :label="$t('storesRequisition.applicationNumber')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.applyCode" />
      </FormItem>
      <!-- 申请日期 -->
      <FormItem
        :label="$t('storesRequisition.applicationDate')"
        style="margin-bottom: 1em"
      >
        <DatePicker
          v-model:value="queryParams.applyDate"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </FormItem>
      <!-- 产品名称 -->
      <FormItem
        :label="$t('storesRequisition.productName')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.productName" />
      </FormItem>
      <!-- 计划号 -->
      <FormItem
        :label="$t('storesRequisition.planCode')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.planCode" />
      </FormItem>
      <!-- 材料名称 -->
      <FormItem
        :label="$t('storesRequisition.materialName')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.materialName" />
      </FormItem>
      <!-- 材料编号 -->
      <FormItem
        :label="$t('storesRequisition.materialNumber')"
        style="margin-bottom: 1em"
      >
        <Input v-model:value="queryParams.materialCode" />
      </FormItem>
      <!-- 领料进度 -->
      <FormItem
        :label="$t('storesRequisition.materialRequisitionProgress')"
        style="margin-bottom: 1em"
      >
        <CheckboxGroup
          v-model:value="queryParams.progress"
          :options="TYPE_OF_MATERIAL_REQUISITION_PROGRESS"
        />
      </FormItem>
      <!-- 领料状态 -->
      <FormItem
        :label="$t('storesRequisition.materialRequisitionStatus')"
        style="margin-bottom: 1em !important"
      >
        <RadioGroup
          v-model:value="queryParams.complete"
          :options="MATERIAL_REQUISITION_STATUS_TYPE"
        />
      </FormItem>
      <FormItem style="margin-bottom: 1em">
        <Button type="primary" @click="handleSearch">
          {{ $t('common.search') }}
        </Button>
      </FormItem>
    </Form>
    <!-- endregion -->

    <!-- region 表格 -->
    <Grid>
      <template #toolbar-tools>
        <Space>
          <Button @click="handlePrint">
            {{ $t('storesRequisition.print2428') }}
          </Button>
          <Button @click="handlePrint">
            {{ $t('storesRequisition.print2414') }}
          </Button>
        </Space>
      </template>
      <template #selectedState="{ row, column }">
        <Checkbox v-model:checked="row[column.field]" disabled />
      </template>
    </Grid>
    <!-- endregion -->

    <template #footer>
      <Space>
        <Button @click="handleClose">
          {{ $t('common.cancel') }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
