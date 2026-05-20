<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 moldMounting API
 * [OUTPUT]: 对外提供模具变更记录页面组件
 * [POS]: 设备管理模块 的模具变更记录页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-20 13:20:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMoldOperationListPage } from '#/api/equipManagement/moldMounting.service';
import type { MoldOperationListParams, MoldOperationRecord } from '#/api/equipManagement/moldMounting.service';
import { $t } from '#/locales';

// ========== 查询参数 ==========
const queryParams = ref<{
  equipmentCode: string | undefined;
  operationType: string | undefined;
  searchTime: [Dayjs, Dayjs] | undefined;
}>({
  equipmentCode: undefined,
  operationType: undefined,
  searchTime: undefined,
});

// ========== 下拉选项 ==========
const operationTypeOptions = [
  { label: $t('moldChangeRecord.operationTypeInstall'), value: 'INSTALL' },
  { label: $t('moldChangeRecord.operationTypeRemove'), value: 'REMOVE' },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<MoldOperationRecord> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'operationTypeName',
      title: $t('moldChangeRecord.operationTypeName'),
      minWidth: 100,
    },
    {
      field: 'moldCode',
      title: $t('moldChangeRecord.moldCode'),
      minWidth: 120,
    },
    {
      field: 'moldName',
      title: $t('moldChangeRecord.moldName'),
      minWidth: 140,
    },
    {
      field: 'equipmentCode',
      title: $t('moldChangeRecord.equipmentCode'),
      minWidth: 120,
    },
    {
      field: 'workOrderNo',
      title: $t('moldChangeRecord.workOrderNo'),
      minWidth: 140,
    },
    {
      field: 'operator',
      title: $t('moldChangeRecord.operator'),
      minWidth: 100,
    },
    {
      field: 'operationTime',
      title: $t('moldChangeRecord.operationTime'),
      minWidth: 160,
    },
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

const gridEvents: VxeGridListeners<MoldOperationRecord> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise<{ items: MoldOperationRecord[]; total: number }>(
    (resolve) => {
      const params: MoldOperationListParams = {
        equipmentCode: queryParams.value.equipmentCode,
        operationType: queryParams.value.operationType,
        pageNum,
        pageSize,
      };

      // 处理时间范围查询
      if (
        queryParams.value.searchTime &&
        queryParams.value.searchTime.length === 2
      ) {
        params.startTime = queryParams.value.searchTime[0].format('YYYY-MM-DD');
        params.endTime = queryParams.value.searchTime[1].format('YYYY-MM-DD');
      }

      getMoldOperationListPage(params)
        .then((res: any) => {
          resolve({
            items: res.results || [],
            total: res.total || res.count || 0,
          });
        })
        .catch(() => {
          resolve({
            items: [],
            total: 0,
          });
        });
    },
  );
}

// ========== 操作 ==========

/**
 * 重置查询参数
 */
function handleReset() {
  queryParams.value = {
    equipmentCode: undefined,
    operationType: undefined,
    searchTime: undefined,
  };
  gridApi.reload();
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编码 -->
        <FormItem
          :label="$t('moldChangeRecord.equipmentCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('moldChangeRecord.equipmentCodePlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 操作类型 -->
        <FormItem
          :label="$t('moldChangeRecord.operationType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.operationType"
            :placeholder="$t('moldChangeRecord.operationTypePlaceholder')"
            allow-clear
            :options="operationTypeOptions"
            style="width: 140px"
          />
        </FormItem>

        <!-- 时间范围 -->
        <FormItem
          :label="$t('moldChangeRecord.timeRange')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            format="YYYY-MM-DD"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('moldChangeRecord.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            <Icon
              icon="mdi:magnify"
              class="inline-block align-middle text-base -mt-0.5"
            />
            {{ $t('moldChangeRecord.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid />
    </Card>
  </Page>
</template>
