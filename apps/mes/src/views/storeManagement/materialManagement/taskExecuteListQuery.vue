<script lang="ts" setup>
/**
 * RCS任务执行列表查询页面
 * 功能：查询RCS（机器人控制系统）任务执行列表，包括任务号、箱码/货架、储位信息等
 *
 * 主要功能模块：
 * 1. 任务列表查询（按单据号、外箱码、储位号、料号）
 * 2. 任务状态展示
 */

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { rcsTaskExecutionListQuery } from '#/api';
import { $t } from '#/locales';

// ========== 执行状态映射 ==========
const taskStateMap: Record<number, { color: string; label: string }> = {
  '-2': { color: 'default', label: '已取消' },
  '-1': { color: 'warning', label: '待执行' },
  '0': { color: 'processing', label: '执行中' },
  '1': { color: 'success', label: '已完成' },
  '2': { color: 'error', label: '执行失败' },
};

/**
 * 主表格查询参数
 */
const queryParams = ref<any>({
  formCode: '',
  packingCode: '',
  storageCode: '',
  materialCode: '',
});

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'taskCode', title: $t('storeManagement.taskExecuteListQuery.taskCode'), minWidth: 200 },
    { field: 'formCode', title: $t('storeManagement.taskExecuteListQuery.formCode'), minWidth: 150 },
    { field: 'boxCode', title: $t('storeManagement.taskExecuteListQuery.boxCode'), minWidth: 120 },
    { field: 'inStorageCode', title: $t('storeManagement.taskExecuteListQuery.inStorageCode'), minWidth: 200 },
    { field: 'storageCode', title: $t('storeManagement.taskExecuteListQuery.targetStorageCode'), minWidth: 200 },
    {
      field: 'taskState',
      title: $t('storeManagement.taskExecuteListQuery.taskState'),
      minWidth: 100,
      slots: { default: 'taskState' },
    },
    { field: 'createTime', title: $t('storeManagement.taskExecuteListQuery.createTime'), minWidth: 170 },
    { field: 'updateTime', title: $t('storeManagement.taskExecuteListQuery.updateTime'), minWidth: 170 },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve) => {
    const params: any = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    rcsTaskExecutionListQuery(params)
      .then(({ total, list }) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
      });
  });
}

/**
 * 重置查询条件并重新查询
 */
function handleReset() {
  queryParams.value = {
    formCode: '',
    packingCode: '',
    storageCode: '',
    materialCode: '',
  };
  gridApi.reload();
}
</script>

<template>
  <Page>
    <!-- region 顶部搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 单据号 -->
        <FormItem
          :label="$t('storeManagement.taskExecuteListQuery.formCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.formCode"
            allow-clear
          />
        </FormItem>

        <!-- 外箱码/货架号 -->
        <FormItem
          :label="$t('storeManagement.taskExecuteListQuery.packingCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.packingCode"
            allow-clear
          />
        </FormItem>

        <!-- 货架储位号 -->
        <FormItem
          :label="$t('storeManagement.taskExecuteListQuery.storageCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.storageCode"
            allow-clear
          />
        </FormItem>

        <!-- 料号 -->
        <FormItem
          :label="$t('storeManagement.taskExecuteListQuery.materialCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.materialCode"
            allow-clear
          />
        </FormItem>

        <!-- 查询 & 重置 -->
        <FormItem style="margin-bottom: 1em">
          <Space>
            <Button
              :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
              type="primary"
              @click="() => gridApi.reload()"
            >
              {{ $t('common.search') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 主表格区域 -->
    <Card>
      <Grid>
        <!-- 执行状态插槽 -->
        <template #taskState="{ row }">
          <Tag :color="taskStateMap[row.taskState]?.color ?? 'default'">
            {{ taskStateMap[row.taskState]?.label ?? row.taskState }}
          </Tag>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>
