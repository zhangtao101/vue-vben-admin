<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 maintenanceAlert API
 * [OUTPUT]: 对外提供模具保养预警页面组件
 * [POS]: 设备管理模块 的模具保养预警页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-21 10:15:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type {
  MaintenanceAlertPageParams,
  MaintenanceAlertRecord,
} from '#/api/equipManagement/maintenanceAlert.service';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Drawer,
  Form,
  FormItem,
  Input,
  RangePicker,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMaintenanceAlertPage } from '#/api/equipManagement/maintenanceAlert.service';
import { $t } from '#/locales';

// ========== 查询参数 ==========
const queryParams = ref<{
  alertType: string | undefined;
  isHandled: number | undefined;
  keyword: string | undefined;
  searchTime: [Dayjs, Dayjs] | undefined;
}>({
  alertType: undefined,
  isHandled: undefined,
  keyword: undefined,
  searchTime: undefined,
});

// ========== 下拉选项 ==========
const alertTypeOptions = [
  { label: $t('maintenanceAlert.alertTypeAdvance'), value: 'ADVANCE' },
  { label: $t('maintenanceAlert.alertTypeBlock'), value: 'BLOCK' },
  {
    label: $t('maintenanceAlert.alertTypeMaintenanceDue'),
    value: 'MAINTENANCE_DUE',
  },
  { label: $t('maintenanceAlert.alertTypeUsageCount'), value: 'USAGE_COUNT' },
  { label: $t('maintenanceAlert.alertTypeUsageTime'), value: 'USAGE_TIME' },
];

const isHandledOptions = [
  { label: $t('maintenanceAlert.isHandledUntreated'), value: 0 },
  { label: $t('maintenanceAlert.isHandledHandled'), value: 1 },
];

// ========== 表格配置 ==========
const gridOptions: VxeGridProps<MaintenanceAlertRecord> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'moldCode',
      title: $t('maintenanceAlert.moldCode'),
      minWidth: 120,
    },
    {
      field: 'moldName',
      title: $t('maintenanceAlert.moldName'),
      minWidth: 140,
    },
    {
      field: 'alertTypeName',
      title: $t('maintenanceAlert.alertTypeName'),
      minWidth: 120,
    },
    {
      field: 'alertReason',
      title: $t('maintenanceAlert.alertReason'),
      minWidth: 180,
      showOverflow: true,
    },
    {
      field: 'alertTime',
      title: $t('maintenanceAlert.alertTime'),
      minWidth: 160,
    },
    {
      field: 'handleStatusName',
      title: $t('maintenanceAlert.handleStatusName'),
      minWidth: 100,
      slots: { default: 'handleStatus' },
    },
    {
      field: 'action',
      title: $t('maintenanceAlert.handle'),
      width: 120,
      slots: { default: 'action' },
      fixed: 'right',
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

const gridEvents: VxeGridListeners<MaintenanceAlertRecord> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 数据查询 ==========
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise<{ items: MaintenanceAlertRecord[]; total: number }>(
    (resolve) => {
      const params: MaintenanceAlertPageParams = {
        keyword: queryParams.value.keyword,
        alertType: queryParams.value.alertType,
        isHandled: queryParams.value.isHandled,
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

      getMaintenanceAlertPage(params)
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
 * 重置查询参数并刷新列表
 * @returns 无返回值
 * @since 2026-05-21 10:15:00
 */
function handleReset() {
  queryParams.value = {
    keyword: undefined,
    alertType: undefined,
    isHandled: undefined,
    searchTime: undefined,
  };
  gridApi.reload();
}

// ========== 详情抽屉 ==========
const detailVisible = ref(false);
const detailRow = ref<MaintenanceAlertRecord | null>(null);

/**
 * 打开预警详情抽屉
 * @param row - 预警记录行数据
 * @returns 无返回值
 * @since 2026-05-21 10:15:00
 */
function handleDetail(row: MaintenanceAlertRecord) {
  detailRow.value = row;
  detailVisible.value = true;
}

// ========== 状态颜色映射 ==========
const statusColorMap: Record<string, string> = {
  已处理: 'success',
  未处理: 'error',
};
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 关键词 -->
        <FormItem
          :label="$t('maintenanceAlert.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('maintenanceAlert.keywordPlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 预警类型 -->
        <FormItem
          :label="$t('maintenanceAlert.alertType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.alertType"
            :placeholder="$t('maintenanceAlert.alertTypePlaceholder')"
            allow-clear
            :options="alertTypeOptions"
            style="width: 160px"
          />
        </FormItem>

        <!-- 处理状态 -->
        <FormItem
          :label="$t('maintenanceAlert.isHandled')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.isHandled"
            :placeholder="$t('maintenanceAlert.isHandledPlaceholder')"
            allow-clear
            :options="isHandledOptions"
            style="width: 140px"
          />
        </FormItem>

        <!-- 时间范围 -->
        <FormItem
          :label="$t('maintenanceAlert.timeRange')"
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
            {{ $t('maintenanceAlert.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            <Icon
              icon="mdi:magnify"
              class="inline-block align-middle text-base -mt-0.5"
            />
            {{ $t('maintenanceAlert.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools></template>
        <!-- 处理状态插槽 -->
        <template #handleStatus="{ row }">
          <Tag :color="statusColorMap[row.handleStatusName] || 'default'">
            {{ row.handleStatusName }}
          </Tag>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleDetail(row)" class="px-1">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('maintenanceAlert.detailTitle')"
      width="500"
      :destroy-on-close="true"
    >
      <div v-if="detailRow">
        <Form layout="vertical">
          <FormItem :label="$t('maintenanceAlert.moldCode')">
            <Input :value="detailRow.moldCode" disabled />
          </FormItem>
          <FormItem :label="$t('maintenanceAlert.moldName')">
            <Input :value="detailRow.moldName" disabled />
          </FormItem>
          <FormItem :label="$t('maintenanceAlert.alertTypeName')">
            <Input :value="detailRow.alertTypeName" disabled />
          </FormItem>
          <FormItem :label="$t('maintenanceAlert.alertReason')">
            <Input :value="detailRow.alertReason" disabled />
          </FormItem>
          <FormItem :label="$t('maintenanceAlert.alertTime')">
            <Input :value="detailRow.alertTime" disabled />
          </FormItem>
          <FormItem :label="$t('maintenanceAlert.handleStatusName')">
            <Input :value="detailRow.handleStatusName" disabled />
          </FormItem>
          <template v-if="detailRow.isHandled === 1">
            <FormItem :label="$t('maintenanceAlert.handleResult')">
              <Input :value="detailRow.handleResult ?? '-'" disabled />
            </FormItem>
            <FormItem :label="$t('maintenanceAlert.handleRemark')">
              <Input :value="detailRow.handleRemark ?? '-'" disabled />
            </FormItem>
            <FormItem :label="$t('maintenanceAlert.handledBy')">
              <Input :value="detailRow.handledBy ?? '-'" disabled />
            </FormItem>
            <FormItem :label="$t('maintenanceAlert.handledTime')">
              <Input :value="detailRow.handledTime ?? '-'" disabled />
            </FormItem>
          </template>
        </Form>
      </div>
    </Drawer>
  </Page>
</template>
