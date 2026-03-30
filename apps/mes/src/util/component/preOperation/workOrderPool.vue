<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 查询条件
const queryParams = ref<any>({
  workOrderNo: '',
  productName: '',
  dateRange: [],
});

/**
 * 查询函数
 */
function handleQuery() {
  console.log('查询参数:', queryParams.value);
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 5,
      items: [
        {
          index: 1,
          workOrderNo: 'WO20260301001',
          productCode: 'PCB-A001',
          productName: 'PCB主板A型',
          workOrderTotal: 1000,
          demandDate: '2026-03-31',
          workOrderStatus: '待生产',
        },
        {
          index: 2,
          workOrderNo: 'WO20260301002',
          productCode: 'PCB-A002',
          productName: 'PCB主板B型',
          workOrderTotal: 800,
          demandDate: '2026-04-01',
          workOrderStatus: '生产中',
        },
        {
          index: 3,
          workOrderNo: 'WO20260301003',
          productCode: 'PCB-B001',
          productName: 'PCB控制板A型',
          workOrderTotal: 1200,
          demandDate: '2026-04-02',
          workOrderStatus: '待生产',
        },
        {
          index: 4,
          workOrderNo: 'WO20260301004',
          productCode: 'PCB-B002',
          productName: 'PCB控制板B型',
          workOrderTotal: 600,
          demandDate: '2026-04-03',
          workOrderStatus: '已完成',
        },
        {
          index: 5,
          workOrderNo: 'WO20260301005',
          productCode: 'PCB-C001',
          productName: 'PCB电源板A型',
          workOrderTotal: 900,
          demandDate: '2026-04-04',
          workOrderStatus: '生产中',
        },
      ],
    });
  });
}

/**
 * 工单同步函数
 */
function handleWorkOrderSync() {
  console.log('工单同步');
  // TODO: 调用工单同步接口
}

// endregion

// region 表格配置

/**
 * VXE表格配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'index', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'workOrderNo',
      title: $t('preOperation.workOrderNo'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('preOperation.productCode'),
      minWidth: 150,
    },
    {
      field: 'productName',
      title: $t('preOperation.productName'),
      minWidth: 150,
    },
    {
      field: 'workOrderTotal',
      title: $t('preOperation.workOrderTotal'),
      minWidth: 120,
    },
    {
      field: 'demandDate',
      title: $t('preOperation.demandDate'),
      minWidth: 150,
    },
    {
      field: 'workOrderStatus',
      title: $t('preOperation.workOrderStatus'),
      minWidth: 120,
    },
  ],
  height: 400,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await handleQuery();
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid] = useVbenVxeGrid({ gridOptions });

// endregion
</script>

<template>
  <!-- 查询条件 -->
  <Card class="!mb-4">
    <Form :model="queryParams" layout="inline">
      <!-- 工单号 -->
      <FormItem :label="$t('preOperation.workOrderNo')">
        <Input
          v-model:value="queryParams.workOrderNo"
          :placeholder="$t('preOperation.workOrderNo')"
          style="width: 200px"
        />
      </FormItem>

      <!-- 品名 -->
      <FormItem :label="$t('preOperation.productName')">
        <Input
          v-model:value="queryParams.productName"
          :placeholder="$t('preOperation.productName')"
          style="width: 200px"
        />
      </FormItem>

      <!-- 日期范围 -->
      <FormItem :label="$t('preOperation.dateRange')">
        <RangePicker
          v-model:value="queryParams.dateRange"
          format="YYYY-MM-DD"
          style="width: 300px"
        />
      </FormItem>

      <!-- 查询按钮 -->
      <FormItem>
        <Button type="primary" @click="handleQuery">
          {{ $t('common.search') }}
        </Button>
      </FormItem>
    </Form>
  </Card>

  <!-- 工单总列表 -->
  <Card :title="$t('preOperation.workOrderTotalList')">
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="handleWorkOrderSync">
          {{ $t('preOperation.workOrderSync') }}
        </Button>
      </template>
    </Grid>
  </Card>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
