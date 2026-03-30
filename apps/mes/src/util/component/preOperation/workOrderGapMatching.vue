<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { Button, Card, Col, Row } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import PendingMatchingWorkOrderList from './pendingMatchingWorkOrderList.vue';
import UnmatchedWorkOrderPool from './unmatchedWorkOrderPool.vue';

/**
 * 查询函数
 */
function handleQuery() {
  console.log('工单匹配查询');
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 3,
      items: [
        {
          index: 1,
          productName: 'PCB主板A型',
          productCode: 'PCB-A001',
          documentType: '工单',
          documentNo: 'WO20260301001',
          gapQuantity: 300,
          scheduledQuantity: 300,
          demandDate: '2026-03-31',
        },
        {
          index: 2,
          productName: 'PCB显示板A型',
          productCode: 'PCB-D001',
          documentType: '工单',
          documentNo: 'WO20260301006',
          gapQuantity: 800,
          scheduledQuantity: 800,
          demandDate: '2026-03-31',
        },
        {
          index: 3,
          productName: 'PCB接口板A型',
          productCode: 'PCB-I001',
          documentType: '工单',
          documentNo: 'WO20260301008',
          gapQuantity: 600,
          scheduledQuantity: 600,
          demandDate: '2026-04-02',
        },
      ],
    });
  });
}

/**
 * 确认
 */
function handleConfirm() {
  console.log('确认');
  // TODO: 调用确认接口
}

// region 表格配置

/**
 * VXE表格配置
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', title: $t('preOperation.sequence'), width: 80 },
    {
      field: 'productName',
      title: $t('preOperation.productName'),
      minWidth: 150,
    },
    {
      field: 'productCode',
      title: $t('preOperation.productCode'),
      minWidth: 120,
    },
    { field: 'documentType', title: '单别', width: 100 },
    { field: 'documentNo', title: '单号', minWidth: 150 },
    { field: 'gapQuantity', title: $t('preOperation.gapQuantity'), width: 120 },
    { field: 'scheduledQuantity', title: '预排数', width: 120 },
    {
      field: 'demandDate',
      title: $t('preOperation.demandDate'),
      minWidth: 150,
    },
  ],
  height: 300,
  stripe: true,
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
  <Row :gutter="16">
    <Col :span="12">
      <UnmatchedWorkOrderPool />
    </Col>
    <Col :span="12">
      <PendingMatchingWorkOrderList />
    </Col>
  </Row>

  <!-- 工单匹配表格 -->
  <Row class="!mt-4">
    <Col :span="24">
      <Card :title="$t('preOperation.workOrderMatching')">
        <Grid>
          <template #toolbar-tools>
            <Button type="primary" @click="handleConfirm"> 确认 </Button>
          </template>
        </Grid>
      </Card>
    </Col>
  </Row>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
