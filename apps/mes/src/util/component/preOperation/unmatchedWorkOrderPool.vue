<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Card, Form, FormItem, Input, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 查询条件
const queryParams = ref<any>({
  workOrderNo: '',
  productName: '',
});

/**
 * 工单同步
 */
function handleSync() {
  console.log('工单同步');
  // TODO: 调用工单同步接口
}

/**
 * 匹配
 */
function handleMatch() {
  console.log('匹配');
  // TODO: 调用匹配接口
}

/**
 * 查询函数
 */
function handleQuery() {
  console.log('未匹配工单池查询参数:', queryParams.value);
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 5,
      items: [
        {
          index: 1,
          workOrderNo: 'WO20260301001',
          productName: 'PCB主板A型',
          workOrderTotal: 1000,
          unmatchedQuantity: 300,
          demandDate: '2026-03-31',
        },
        {
          index: 2,
          workOrderNo: 'WO20260301002',
          productName: 'PCB主板B型',
          workOrderTotal: 800,
          unmatchedQuantity: 200,
          demandDate: '2026-04-01',
        },
        {
          index: 3,
          workOrderNo: 'WO20260301003',
          productName: 'PCB控制板A型',
          workOrderTotal: 1200,
          unmatchedQuantity: 500,
          demandDate: '2026-04-02',
        },
        {
          index: 4,
          workOrderNo: 'WO20260301004',
          productName: 'PCB控制板B型',
          workOrderTotal: 600,
          unmatchedQuantity: 150,
          demandDate: '2026-04-03',
        },
        {
          index: 5,
          workOrderNo: 'WO20260301005',
          productName: 'PCB电源板A型',
          workOrderTotal: 900,
          unmatchedQuantity: 400,
          demandDate: '2026-04-04',
        },
      ],
    });
  });
}

// endregion

// region 表格配置

/**
 * VXE表格配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    checkField: 'checked',
    highlight: true,
    range: true,
  },
  columns: [
    { type: 'checkbox', width: 60 },
    { type: 'seq', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'workOrderNo',
      title: $t('preOperation.workOrderNo'),
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
      field: 'unmatchedQuantity',
      title: $t('preOperation.unmatchedQuantity'),
      minWidth: 120,
    },
    {
      field: 'demandDate',
      title: $t('preOperation.demandDate'),
      minWidth: 150,
    },
  ],
  height: 300,
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
  <Card>
    <!-- 查询条件 -->
    <Form :model="queryParams" layout="inline" class="!mb-4">
      <!-- 工单号 -->
      <FormItem :label="$t('preOperation.workOrderNo')">
        <Input
          v-model:value="queryParams.workOrderNo"
          :placeholder="`${$t('preOperation.workOrderNo')}`"
          style="width: 200px"
        />
      </FormItem>

      <!-- 品名 -->
      <FormItem :label="$t('preOperation.productName')">
        <Input
          v-model:value="queryParams.productName"
          :placeholder="`${$t('preOperation.productName')}`"
          style="width: 200px"
        />
      </FormItem>

      <!-- 查询按钮 -->
      <FormItem>
        <Button type="primary" @click="handleQuery">
          {{ $t('common.search') }}
        </Button>
      </FormItem>
    </Form>

    <!-- 未匹配工单池表格 -->
    <Grid>
      <template #toolbar-tools>
        <Space>
          <Button @click="handleSync" type="primary"> 工单同步 </Button>
          <Button @click="handleMatch"> 匹配 </Button>
        </Space>
      </template>
    </Grid>
  </Card>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
