<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// region 查询条件
const queryParams = ref<any>({
  timeRange: [],
});

// 装配类型：机装/手装
const assemblyType = ref<string>('machine');

/**
 * 任务同步
 */
function handleTaskSync() {
  console.log('任务同步');
  // TODO: 调用任务同步接口
}

/**
 * 手动调整
 */
function handleManualAdjust() {
  console.log('手动调整');
  // TODO: 调用手动调整接口
}

/**
 * 查询函数
 */
function handleQuery() {
  console.log('工时评估查询参数:', queryParams.value);
  // TODO: 调用查询接口
  return new Promise((resolve) => {
    // 模拟假数据
    resolve({
      total: 5,
      items: [
        {
          sequence: 1,
          documentType: '工单',
          month: '2026-03',
          week: '第13周',
          workOrderNo: 'WO20260301001',
          materialNo: 'PCB-A001',
          specification: 'A型',
          model: 'Model-01',
          color: '绿色',
          unit: 'PCS',
          systemQuantity: 1000,
          taskQuantity: 1000,
          mouldNo: 'M001',
          type: '正常',
          unproducedQuantity: 0,
          quota: 50,
          laborHours: 20,
          personnel: '张三',
        },
        {
          sequence: 2,
          documentType: '工单',
          month: '2026-03',
          week: '第13周',
          workOrderNo: 'WO20260301002',
          materialNo: 'PCB-B001',
          specification: 'B型',
          model: 'Model-02',
          color: '蓝色',
          unit: 'PCS',
          systemQuantity: 800,
          taskQuantity: 800,
          mouldNo: 'M002',
          type: '正常',
          unproducedQuantity: 100,
          quota: 40,
          laborHours: 20,
          personnel: '李四',
        },
        {
          sequence: 3,
          documentType: '工单',
          month: '2026-03',
          week: '第13周',
          workOrderNo: 'WO20260301003',
          materialNo: 'PCB-C001',
          specification: 'C型',
          model: 'Model-03',
          color: '红色',
          unit: 'PCS',
          systemQuantity: 1200,
          taskQuantity: 1200,
          mouldNo: 'M003',
          type: '正常',
          unproducedQuantity: 200,
          quota: 60,
          laborHours: 20,
          personnel: '王五',
        },
        {
          sequence: 4,
          documentType: '工单',
          month: '2026-03',
          week: '第14周',
          workOrderNo: 'WO20260301004',
          materialNo: 'PCB-D001',
          specification: 'D型',
          model: 'Model-04',
          color: '黄色',
          unit: 'PCS',
          systemQuantity: 600,
          taskQuantity: 600,
          mouldNo: 'M004',
          type: '加急',
          unproducedQuantity: 0,
          quota: 30,
          laborHours: 20,
          personnel: '赵六',
        },
        {
          sequence: 5,
          documentType: '工单',
          month: '2026-03',
          week: '第14周',
          workOrderNo: 'WO20260301005',
          materialNo: 'PCB-E001',
          specification: 'E型',
          model: 'Model-05',
          color: '白色',
          unit: 'PCS',
          systemQuantity: 900,
          taskQuantity: 900,
          mouldNo: 'M005',
          type: '正常',
          unproducedQuantity: 150,
          quota: 45,
          laborHours: 20,
          personnel: '孙七',
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
  columns: [
    { type: 'seq', title: $t('basic.laborHourEvaluation.sequence'), width: 80 },
    {
      field: 'documentType',
      title: $t('basic.laborHourEvaluation.documentType'),
      width: 100,
    },
    {
      field: 'month',
      title: $t('basic.laborHourEvaluation.month'),
      width: 100,
    },
    { field: 'week', title: $t('basic.laborHourEvaluation.week'), width: 100 },
    {
      field: 'workOrderNo',
      title: $t('basic.laborHourEvaluation.workOrderNo'),
      minWidth: 150,
    },
    {
      field: 'materialNo',
      title: $t('basic.laborHourEvaluation.materialNo'),
      minWidth: 120,
    },
    {
      field: 'specification',
      title: $t('basic.laborHourEvaluation.specification'),
      width: 100,
    },
    {
      field: 'model',
      title: $t('basic.laborHourEvaluation.model'),
      width: 100,
    },
    { field: 'color', title: $t('basic.laborHourEvaluation.color'), width: 80 },
    { field: 'unit', title: $t('basic.laborHourEvaluation.unit'), width: 80 },
    {
      field: 'systemQuantity',
      title: $t('basic.laborHourEvaluation.systemQuantity'),
      width: 100,
    },
    {
      field: 'taskQuantity',
      title: $t('basic.laborHourEvaluation.taskQuantity'),
      width: 120,
    },
    {
      field: 'mouldNo',
      title: $t('basic.laborHourEvaluation.mouldNo'),
      width: 100,
    },
    { field: 'type', title: $t('basic.laborHourEvaluation.type'), width: 80 },
    {
      field: 'unproducedQuantity',
      title: $t('basic.laborHourEvaluation.unproducedQuantity'),
      width: 120,
    },
    { field: 'quota', title: $t('basic.laborHourEvaluation.quota'), width: 80 },
    {
      field: 'laborHours',
      title: $t('basic.laborHourEvaluation.laborHours'),
      width: 80,
    },
    {
      field: 'personnel',
      title: $t('basic.laborHourEvaluation.personnel'),
      width: 100,
    },
  ],
  height: 500,
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion
</script>

<template>
  <Page>
    <!-- 上方Card - 查询条件 -->
    <Card>
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('basic.laborHourEvaluation.timeRange')">
          <RangePicker
            v-model:value="queryParams.timeRange"
            format="YYYY-MM-DD HH"
            show-time
            style="width: 400px"
          />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 下方Card - 表格 -->
    <Card class="!mt-4">
      <Grid>
        <template #toolbar-actions>
          <span class="mr-4"
            >{{ $t('basic.laborHourEvaluation.assemblyType') }}:</span
          >
          <RadioGroup v-model:value="assemblyType" button-style="solid">
            <RadioButton value="machine">
              {{ $t('basic.laborHourEvaluation.machineAssembly') }}
            </RadioButton>
            <RadioButton value="manual">
              {{ $t('basic.laborHourEvaluation.manualAssembly') }}
            </RadioButton>
          </RadioGroup>
        </template>
        <template #toolbar-tools>
          <Space>
            <Button @click="handleTaskSync" type="primary">
              {{ $t('basic.laborHourEvaluation.taskSync') }}
            </Button>
            <Button @click="handleManualAdjust">
              {{ $t('basic.laborHourEvaluation.manualAdjust') }}
            </Button>
          </Space>
        </template>
      </Grid>
    </Card>
  </Page>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
