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
 * 确认匹配
 */
function handleConfirm() {
  console.log('确认匹配');
  // TODO: 调用确认匹配接口
}

/**
 * 移出
 */
function handleRemove() {
  console.log('移出');
  // TODO: 调用移出接口
}

/**
 * 查询函数
 */
function handleQuery() {
  console.log('待匹配工单列表查询参数:', queryParams.value);
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 5,
      items: [
        {
          index: 1,
          workOrderNo: 'WO20260301006',
          productName: 'PCB显示板A型',
          workOrderTotal: 1000,
          remainingQuantity: 800,
          demandDate: '2026-03-31',
        },
        {
          index: 2,
          workOrderNo: 'WO20260301007',
          productName: 'PCB显示板B型',
          workOrderTotal: 700,
          remainingQuantity: 500,
          demandDate: '2026-04-01',
        },
        {
          index: 3,
          workOrderNo: 'WO20260301008',
          productName: 'PCB接口板A型',
          workOrderTotal: 900,
          remainingQuantity: 600,
          demandDate: '2026-04-02',
        },
        {
          index: 4,
          workOrderNo: 'WO20260301009',
          productName: 'PCB接口板B型',
          workOrderTotal: 800,
          remainingQuantity: 300,
          demandDate: '2026-04-03',
        },
        {
          index: 5,
          workOrderNo: 'WO20260301010',
          productName: 'PCB扩展板A型',
          workOrderTotal: 1100,
          remainingQuantity: 700,
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
  rowConfig: {
    drag: true,
  },
  columns: [
    { type: 'seq', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'workOrderNo',
      title: $t('preOperation.workOrderNo'),
      minWidth: 150,
      dragSort: true,
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
      field: 'remainingQuantity',
      title: $t('preOperation.remainingQuantity'),
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

    <!-- 待匹配工单列表表格 -->
    <Grid>
      <template #toolbar-tools>
        <Space>
          <Button type="primary" @click="handleConfirm"> 确认 </Button>
          <Button @click="handleRemove"> 移出 </Button>
        </Space>
      </template>
    </Grid>
  </Card>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
