<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted } from 'vue';

import { CarbonTaskComplete, MdQrcodeScan } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button, Tooltip } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

/**
 * 获取清洗状态描述
 */
function obtainTheDeviceCleanStatus(status: number) {
  switch (status) {
    case 1: {
      return $t('productionOperation.yes');
    }
    case 2: {
      return $t('productionOperation.beCleaning');
    }
    case 3: {
      return $t('productionOperation.completed');
    }
    default: {
      return $t('productionOperation.no');
    }
  }
}

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-24 border p-2 text-center';
}

// region 数据查询
// 查询条件
// const queryParams = ref<any>({});

// 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'isQualityTest',
      title: '物料编号',
      minWidth: 80,
    },
    {
      field: 'isHalf',
      title: '物料名称',
      minWidth: 80,
    },
    { field: 'materialCode', title: '目标重量(KG)', minWidth: 150 },
    { field: 'materialName', title: '当前累计投料(KG)', minWidth: 250 },
    { field: 'unit', title: '投料进度(%)', minWidth: 150 },
    { field: 'unit1', title: '投料校验', minWidth: 150 },
    {
      field: 'unit2',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 150,
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          page: page?.currentPage,
          pageSize: page?.pageSize,
        });
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 30,
  },
  scrollX: {
    enabled: true,
    gt: 0,
  },
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: any = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询物料列表
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve) => {
    resolve({
      total: page * pageSize,
      items: [{}],
    });
  });
}

// endregion

onMounted(() => {
  gridApi?.reload();
});
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.implementationStatus') }}
      </span>
      <span :class="getValueClass()">
        {{ obtainTheDeviceCleanStatus(3) }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.currentDeviceFeedingMode') }}
      </span>
      <!-- 手动 -->
      <span :class="getValueClass()">
        {{ $t('productionOperation.manualOperation') }}
      </span>
    </div>
  </div>
  <Grid>
    <template #action>
      <!-- 查看按钮 ="{ row }" -->
      <Tooltip>
        <template #title>
          {{ $t('common.scanTheCodeAndFeedTheMaterial') }}
        </template>
        <Button
          :icon="h(MdQrcodeScan, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
        />
        <!--        @click="editRow(row, true)"-->
      </Tooltip>
      <!-- 查看按钮 -->
      <Tooltip>
        <template #title>{{ $t('common.feedingComplete') }}</template>
        <Button
          :icon="h(CarbonTaskComplete, { class: 'inline-block size-6' })"
          class="mr-4"
          type="link"
        />
      </Tooltip>
    </template>
  </Grid>
</template>

<style scoped></style>
