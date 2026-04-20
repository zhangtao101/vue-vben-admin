<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairRequest.service API
 * [OUTPUT]: 对外提供维修工单列表页面组件，含工单列表、指派、查看详情、取消功能
 * [POS]: 维修维护模块 的工单管理页面，管理所有维修工单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-04-20 15:13:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

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
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRepairRequestListWithFilter } from '#/api';
import { $t } from '#/locales';

// 查询参数
/** 工单列表查询参数，包含设备编码、状态、报修类型、紧急程度 */
const queryParams = ref<any>({
  equipmentCode: '',
  status: undefined,
  repairType: undefined,
  urgentLevel: undefined,
});

// 状态下拉选项
/** 状态下拉选项列表 */
const statusOptions = [
  { label: $t('repair.repairOrder.pending'), value: 'PENDING' },
  { label: $t('repair.repairOrder.processing'), value: 'PROCESSING' },
  { label: $t('repair.repairOrder.completed'), value: 'COMPLETED' },
  { label: $t('repair.repairOrder.cancelled'), value: 'CANCELLED' },
];

// 报修类型选项
/** 报修类型下拉选项列表 */
const repairTypeOptions = [
  { label: $t('repair.repairOrder.emergencyStop'), value: 'RT_EMERGENCY_STOP' },
  {
    label: $t('repair.repairOrder.emergencyNonstop'),
    value: 'RT_EMERGENCY_NONSTOP',
  },
  { label: $t('repair.repairOrder.preventive'), value: 'RT_PREVENTIVE' },
  { label: $t('repair.repairOrder.inspection'), value: 'RT_INSPECTION' },
  { label: $t('repair.repairOrder.andon'), value: 'RT_ANDON' },
  { label: $t('repair.repairOrder.other'), value: 'RT_OTHER' },
];

// 紧急程度选项
/** 紧急程度下拉选项列表 */
const urgentLevelOptions = [
  { label: $t('repair.repairOrder.normal'), value: 'NORMAL' },
  { label: $t('repair.repairOrder.urgent'), value: 'URGENT' },
  { label: $t('repair.repairOrder.critical'), value: 'CRITICAL' },
];

// 状态标签颜色映射
/** 状态标签颜色映射，用于 Tag 组件的颜色设置 */
const statusColorMap: Record<string, string> = {
  PENDING: 'default',
  ASSIGNED: 'processing',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

// 状态中文映射
/** 状态编码到中文名称的映射 */
const statusLabelMap: Record<string, string> = {
  PENDING: '待处理',
  ASSIGNED: '已指派',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

// 紧急程度标签颜色映射
/** 紧急程度标签颜色映射 */
const urgentLevelColorMap: Record<string, string> = {
  NORMAL: 'green',
  URGENT: 'orange',
  CRITICAL: 'red',
};

// 紧急程度中文映射
/** 紧急程度编码到中文名称的映射 */
const urgentLevelLabelMap: Record<string, string> = {
  NORMAL: '一般',
  URGENT: '紧急',
  CRITICAL: '特急',
};

// 报修类型中文映射
/** 报修类型编码到中文名称的映射 */
const repairTypeLabelMap: Record<string, string> = {
  RT_EMERGENCY_STOP: '应急维修(停机)',
  RT_EMERGENCY_NONSTOP: '应急维修(非停机)',
  RT_PREVENTIVE: '预防性维护',
  RT_INSPECTION: '点巡检',
  RT_ANDON: '安灯呼叫',
  RT_OTHER: '其他工单',
};

// 表格配置
/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'requestNo', title: '报修单号', minWidth: 150 },
    { field: 'equipmentCode', title: '设备编码', minWidth: 120 },
    { field: 'equipmentName', title: '设备名称', minWidth: 120 },
    {
      field: 'repairType',
      title: '报修类型',
      minWidth: 130,
      slots: { default: 'repairType' },
    },
    {
      field: 'status',
      title: '状态',
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'urgentLevel',
      title: '紧急程度',
      minWidth: 100,
      slots: { default: 'urgentLevel' },
    },
    { field: 'reportBy', title: '报修人', minWidth: 100 },
    { field: 'reportTime', title: '报修时间', minWidth: 160 },
    {
      field: 'action',
      title: '操作',
      width: 200,
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询维修工单列表数据。
 * @param {{ pageNum: number; pageSize: number }} params - 分页参数。
 * @returns {Promise<{ total: number; items: any[] }>} 包含总数和数据列表的 Promise。
 * @throws {Error} API 调用失败时返回空数据。
 * @since 2026-04-20 15:13:00
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };

    getRepairRequestListWithFilter(params)
      .then(({ total, list }) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({
          total: 0,
          items: [{}],
        });
      });
  });
}

// 详情抽屉
/** 详情抽屉显示状态 */
const detailDrawerVisible = ref(false);
/** 当前操作的行数据 */
const currentRow = ref<any>(null);

/**
 * 处理查看详情按钮点击，打开详情抽屉。
 * @param {any} row - 要查看的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleDetail(row: any) {
  currentRow.value = row;
  detailDrawerVisible.value = true;
}

/**
 * 处理指派按钮点击（待实现）。
 * @param {any} row - 要指派的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleAssign(row: any) {
  console.warn('指派', row);
}

/**
 * 处理取消按钮点击（待实现）。
 * @param {any} row - 要取消的行数据。
 * @returns {void} 无返回值。
 * @since 2026-04-20 15:13:00
 */
function handleCancel(row: any) {
  console.warn('取消', row);
}
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 设备编码 -->
        <FormItem
          :label="$t('repair.repairOrder.equipmentCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('repair.repairOrder.equipmentCode')"
            allow-clear
          />
        </FormItem>

        <!-- 状态 -->
        <FormItem
          :label="$t('repair.repairOrder.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :placeholder="$t('repair.repairOrder.status')"
            allow-clear
            :options="statusOptions"
            class="!w-48"
          />
        </FormItem>

        <!-- 报修类型 -->
        <FormItem
          :label="$t('repair.repairOrder.repairType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.repairType"
            :placeholder="$t('repair.repairOrder.repairType')"
            allow-clear
            :options="repairTypeOptions"
            class="!w-48"
          />
        </FormItem>

        <!-- 紧急程度 -->
        <FormItem
          :label="$t('repair.repairOrder.urgentLevel')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.urgentLevel"
            :placeholder="$t('repair.repairOrder.urgentLevel')"
            allow-clear
            :options="urgentLevelOptions"
            class="!w-48"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
          >
            {{ $t('repair.repairOrder.query') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card :title="$t('repair.repairOrder.repairOrderList')">
      <Grid>
        <template #repairType="{ row }">
          {{ repairTypeLabelMap[row.repairType] || row.repairType || '-' }}
        </template>
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.status]">
            {{ statusLabelMap[row.status] || row.status || '-' }}
          </Tag>
        </template>
        <template #urgentLevel="{ row }">
          <Tag :color="urgentLevelColorMap[row.urgentLevel]">
            {{ urgentLevelLabelMap[row.urgentLevel] || row.urgentLevel || '-' }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('repair.repairOrder.assign') }}</template>
              <Button type="link" @click="handleAssign(row)" class="px-1">
                <Icon
                  icon="mdi:account-arrow-right-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip>
              <template #title>{{ $t('repair.repairOrder.detail') }}</template>
              <Button type="link" @click="handleDetail(row)" class="px-1">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip>
              <template #title>{{ $t('repair.repairOrder.cancel') }}</template>
              <Button
                type="link"
                danger
                @click="handleCancel(row)"
                class="px-1"
              >
                <Icon
                  icon="mdi:close"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailDrawerVisible"
      :title="$t('repair.repairOrder.detailTitle')"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="currentRow">
        <p>
          {{ $t('repair.repairOrder.requestNo') }}：{{ currentRow.requestNo }}
        </p>
      </div>

      <template #footer>
        <Space>
          <Button @click="detailDrawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="detailDrawerVisible = false">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
