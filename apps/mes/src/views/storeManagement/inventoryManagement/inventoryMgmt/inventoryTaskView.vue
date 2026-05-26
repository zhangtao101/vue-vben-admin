<script lang="ts" setup>
/**
 * [INPUT]: 依赖 inventoryTaskView.service.ts 中的 API
 * [OUTPUT]: 对外提供盘点任务查看页面组件
 * [POS]: 库存管理模块 的盘点任务查看页面，与 inventoryTaskView.service.ts 配合使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-26 08:48:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type { InventoryTaskMaterial } from '#/api';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  fetchTaskDetail,
  fetchTaskList,
  fetchTaskMaterialList,
  fetchWarehouseList,
  finishTask,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ========== 下拉选项 ==========

/** 仓库列表选项 */
const warehouseOptions = ref<{ label: string; value: string }[]>([]);

/** 盘点周期类型选项 */
const cycleTypeOptions = [
  { label: $t('inventoryPlanMgmt.monthly'), value: 1 },
  { label: $t('inventoryPlanMgmt.yearly'), value: 2 },
];

/**
 * 根据任务状态值获取标签颜色。
 * @param {number} state - 任务状态值
 * @returns {string} Tag 颜色
 * @since 2026-05-26 08:48:00
 */
function getTaskStateColor(state: number) {
  const colorMap: Record<number, string> = {
    '-1': 'default',
    '0': 'processing',
    '1': 'success',
  };
  return colorMap[state] || 'default';
}

// ========== 表格配置 ==========

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'taskCode',
      title: $t('inventoryTaskView.taskCode'),
      minWidth: 200,
    },
    {
      field: 'stocktakingCode',
      title: $t('inventoryTaskView.stocktakingCode'),
      minWidth: 160,
    },
    {
      field: 'stocktakingName',
      title: $t('inventoryTaskView.stocktakingName'),
      minWidth: 150,
    },
    {
      field: 'taskExecuteTime',
      title: $t('inventoryTaskView.taskExecuteTime'),
      minWidth: 170,
    },
    {
      field: 'taskState',
      title: $t('inventoryTaskView.taskState'),
      width: 100,
      slots: { default: 'taskState' },
    },
    {
      field: 'taskOpUser',
      title: $t('inventoryTaskView.taskOpUser'),
      width: 100,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 150,
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

const gridEvents: VxeGridListeners<any> = {};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// ========== 查询参数 ==========

const queryParams = ref<any>({
  warehouseCode: undefined,
  stocktakingCode: '',
  stocktakingName: '',
  cycleType: undefined,
});

// ========== 数据查询 ==========

/**
 * 分页查询盘点任务列表。
 * @param {Object} params - 分页参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{total: number, items: any[]}>} 包含总数和数据列表的 Promise
 * @since 2026-05-26 08:48:00
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

    fetchTaskList(params)
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

// ========== 详情抽屉控制 ==========

const drawerVisible = ref(false);
const currentRow = ref<any>(null);

/**
 * 打开详情抽屉。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-26 08:48:00
 */
function handleView(row: any) {
  currentRow.value = { ...row };
  drawerVisible.value = true;
  // 重置明细状态并加载料号清单
  selectedMaterialCode.value = '';
  // detailGridApi.grid.loadData([]);
  loadMaterialList(row.id);
}

/**
 * 关闭详情抽屉。
 * @since 2026-05-26 08:48:00
 */
function handleClose() {
  drawerVisible.value = false;
  currentRow.value = {};
  materialGridApi.grid.loadData([]);
  detailGridApi.grid.loadData([]);
}

// ========== 料号清单与盘点明细 ==========

/** 当前选中的料号 */
const selectedMaterialCode = ref('');

/** 料号清单表格配置 */
const materialGridOptions: VxeGridProps<any> = {
  border: true,
  stripe: true,
  rowConfig: {
    isCurrent: true,
    isHover: true
  },
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'materialCode', title: $t('inventoryTaskView.materialCode'), minWidth: 120 },
    { field: 'materialName', title: $t('inventoryTaskView.materialName'), minWidth: 120 },
    { field: 'stockNumber', title: $t('inventoryTaskView.stockNumber'), width: 100 },
    { field: 'checkNumber', title: $t('inventoryTaskView.checkNumber'), width: 100 },
    { field: 'checkStateName', title: $t('inventoryTaskView.checkState'), width: 100, slots: { default: 'materialCheckState' } },
  ],
  data: [],
  height: 250,
  pagerConfig: { enabled: false },
  showOverflow: 'tooltip',
};

const materialGridEvents: VxeGridListeners<any> = {
  cellClick: handleMaterialRowClick,
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridEvents: materialGridEvents,
  gridOptions: materialGridOptions,
});

/** 盘点明细表格配置 */
const detailGridOptions: VxeGridProps<any> = {
  border: true,
  stripe: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'labelCode', title: $t('inventoryTaskView.labelCode'), minWidth: 150 },
    { field: 'materialCode', title: $t('inventoryTaskView.materialCode'), width: 100 },
    { field: 'materialName', title: $t('inventoryTaskView.materialName'), minWidth: 120 },
    { field: 'storageCode', title: $t('inventoryTaskView.storageCode'), minWidth: 160 },
    { field: 'stockNumber', title: $t('inventoryTaskView.stockNumber'), width: 100 },
    { field: 'checkNumber', title: $t('inventoryTaskView.checkNumber'), width: 100 },
    { field: 'checkState', title: $t('inventoryTaskView.checkState'), width: 100, slots: { default: 'detailCheckState' } },
  ],
  data: [],
  height: 250,
  pagerConfig: { enabled: false },
  showOverflow: 'tooltip',
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({ gridOptions: detailGridOptions });

/**
 * 加载盘点料号清单。
 * @param {number} id - 任务ID
 * @since 2026-05-26 09:01:00
 */
function loadMaterialList(id: number) {
  fetchTaskMaterialList(String(id)).then((data) => {
    materialGridApi.grid.loadData(data || []);
  });
}

/**
 * 点击料号清单行时加载对应盘点明细。
 * @param {Object} params - 事件参数
 * @since 2026-05-26 09:01:00
 */
function handleMaterialRowClick({ row }: { row: InventoryTaskMaterial }) {
  selectedMaterialCode.value = row.materialCode;
  fetchTaskDetail({
    recordId: currentRow.value.id,
    materialCode: row.materialCode,
  }).then((data) => {
    detailGridApi.grid.loadData(data || []);
  });
}

/**
 * 根据盘点状态获取标签颜色。
 * @param {number} state - 盘点状态 -1未盘点 1已盘点
 * @returns {string} Tag 颜色
 * @since 2026-05-26 08:54:00
 */
function getCheckStateColor(state: number) {
  const colorMap: Record<number, string> = {
    '-1': 'default',
    '1': 'success',
  };
  return colorMap[state] || 'default';
}

/**
 * 根据盘点状态获取显示文字。
 * @param {number} state - 盘点状态 -1未盘点 1已盘点
 * @returns {string} 状态文字
 * @since 2026-05-26 08:54:00
 */
function getCheckStateLabel(state: number) {
  const labelMap: Record<number, string> = {
    '-1': $t('inventoryTaskView.notChecked'),
    '1': $t('inventoryTaskView.checked'),
  };
  return labelMap[state] || '-';
}

// ========== 任务操作 ==========

/**
 * 任务完结。
 * @param {any} row - 当前操作的行数据对象
 * @since 2026-05-26 08:48:00
 */
function handleFinish(row: any) {
  Modal.confirm({
    cancelText: $t('common.cancel'),
    content: `${$t('inventoryTaskView.taskCode')}: ${row.taskCode}`,
    okText: $t('common.confirm'),
    okType: 'primary',
    onOk() {
      finishTask({ id: row.id }).then(() => {
        message.success($t('inventoryTaskView.finishSuccess'));
        gridApi.query();
      });
    },
    title: $t('inventoryTaskView.confirmFinish'),
  });
}

// ========== 辅助方法 ==========

/**
 * 加载仓库列表选项。
 * @since 2026-05-26 08:48:00
 */
function loadWarehouseOptions() {
  fetchWarehouseList().then((res) => {
    warehouseOptions.value = (res || []).map((item) => ({
      label: item.warehouseName,
      value: item.warehouseCode,
    }));
  });
}

/**
 * 格式化执行时间显示。
 * @param {string} time - 时间字符串
 * @returns {string} 格式化后的时间
 * @since 2026-05-26 08:48:00
 */
function formatTime(time: string) {
  if (!time) return '-';
  return time.replace('T', ' ').slice(0, 19);
}

// ========== 权限控制 ==========

const author = ref<string[]>([]);
const route = useRoute();

/**
 * 组件挂载时执行：加载用户权限和仓库选项。
 * @since 2026-05-26 08:48:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadWarehouseOptions();
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 盘点范围 -->
        <FormItem
          :label="$t('inventoryTaskView.warehouseCode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.warehouseCode"
            :options="warehouseOptions"
            :placeholder="$t('inventoryTaskView.warehouseCode')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 计划编号 -->
        <FormItem
          :label="$t('inventoryTaskView.stocktakingCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.stocktakingCode"
            :placeholder="$t('inventoryTaskView.stocktakingCodePlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>

        <!-- 计划名称 -->
        <FormItem
          :label="$t('inventoryTaskView.stocktakingName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.stocktakingName"
            :placeholder="$t('inventoryTaskView.stocktakingNamePlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>

        <!-- 盘点周期类型 -->
        <FormItem
          :label="$t('inventoryTaskView.cycleType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.cycleType"
            :options="cycleTypeOptions"
            :placeholder="$t('inventoryTaskView.cycleType')"
            allow-clear
            style="width: 140px"
          />
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button
            @click="
              () => {
                queryParams = {
                  warehouseCode: undefined,
                  stocktakingCode: '',
                  stocktakingName: '',
                  cycleType: undefined,
                };
                gridApi.reload();
              }
            "
          >
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <!-- 任务状态插槽 -->
        <template #taskState="{ row }">
          <Tag :color="getTaskStateColor(row.taskState)">
            {{ row.taskStateName || '-' }}
          </Tag>
        </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <!-- 查看详情 -->
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleView(row)">
                <Icon
                  icon="mdi:eye"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>

            <!-- 任务完结 -->
            <Tooltip v-if="author.includes('任务完结') && row.taskState === 1">
              <template #title>{{ $t('inventoryTaskView.finish') }}</template>
              <Button type="link" @click="handleFinish(row)">
                <Icon
                  icon="mdi:check-circle-outline"
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
      v-model:open="drawerVisible"
      :title="$t('inventoryTaskView.detailTitle')"
      :width="800"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
      @close="handleClose"
    >
      <Descriptions :column="1" bordered size="small">
        <Descriptions.Item :label="$t('inventoryTaskView.taskCode')">
          {{ currentRow.taskCode || '-' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.stocktakingCode')">
          {{ currentRow.stocktakingCode || '-' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.stocktakingName')">
          {{ currentRow.stocktakingName || '-' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.planId')">
          {{ currentRow.planId || '-' }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.taskExecuteTime')">
          {{ formatTime(currentRow.taskExecuteTime) }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.taskState')">
          <Tag :color="getTaskStateColor(currentRow.taskState)">
            {{ currentRow.taskStateName || '-' }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item :label="$t('inventoryTaskView.taskOpUser')">
          {{ currentRow.taskOpUser || '-' }}
        </Descriptions.Item>
      </Descriptions>

      <!-- 料号清单 -->
      <div class="mt-4">
        <h4 class="mb-2 text-base font-medium">
          {{ $t('inventoryTaskView.materialListTitle') }}
        </h4>
        <MaterialGrid>
          <template #materialCheckState="{ row }">
            <Tag :color="getCheckStateColor(row.checkState)">
              {{ row.checkStateName || '-' }}
            </Tag>
          </template>
        </MaterialGrid>
      </div>

      <!-- 盘点明细 -->
      <div v-if="selectedMaterialCode" class="mt-4">
        <h4 class="mb-2 text-base font-medium">
          {{ $t('inventoryTaskView.detailListTitle') }}（{{ selectedMaterialCode }}）
        </h4>
        <DetailGrid>
          <template #detailCheckState="{ row }">
            <Tag :color="getCheckStateColor(row.checkState)">
              {{ getCheckStateLabel(row.checkState) }}
            </Tag>
          </template>
        </DetailGrid>
      </div>

      <template #footer>
        <Space>
          <Button @click="handleClose">
            {{ $t('common.cancel') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped></style>
