<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairRequest.service API
 * [OUTPUT]: 对外提供报修单列表页面组件，含报修单列表查询、详情查看、取消功能
 * [POS]: 维修维护模块 的报修单列表页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-14 08:41:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

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
  message,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelRepairRequest,
  getRepairRequestPageList,
  searchBaseConfig,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import RepairRequestDetailDrawer from '#/util/component/repairMaintenance/RepairRequestDetailDrawer.vue';
import RepairRequestDrawer from '#/util/component/repairMaintenance/RepairRequestDrawer.vue';

// ========== 查询参数 ==========
/** 报修单查询参数 */
const queryParams = ref({
  requestNo: undefined as string | undefined,
  equipmentCode: undefined as string | undefined,
  equipmentName: undefined as string | undefined,
  status: undefined as string | undefined,
  repairType: undefined as string | undefined,
});

// ========== 下拉选项 ==========
/** 状态下拉选项列表 */
const statusOptions = [
  { label: $t('repair.repairOrder.all'), value: '' },
  { label: $t('repair.repairOrder.pending'), value: 'PENDING' },
  { label: $t('repair.repairOrder.assigned'), value: 'ASSIGNED' },
  { label: $t('repair.repairOrder.processing'), value: 'PROCESSING' },
  { label: $t('repair.repairOrder.completed'), value: 'COMPLETED' },
  { label: $t('repair.repairOrder.cancelled'), value: 'CANCELLED' },
];

/** 报修类型下拉选项列表 */
const repairTypeOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 初始化下拉选项数据。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
async function initOptions() {
  const res = await searchBaseConfig({ configType: 'REPAIR_TYPE' });
  repairTypeOptions.value = [
    { label: $t('repair.repairOrder.all'), value: '' },
    ...((res || []) as any[]).map((item: any) => ({
      label: item.configName,
      value: item.configCode,
    })),
  ];
}

// ========== 状态格式化 ==========
/** 状态颜色映射 */
const statusColorMap: Record<string, string> = {
  DRAFT: 'default',
  PENDING: 'warning',
  ASSIGNED: 'processing',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

/** 报修类型颜色映射 */
const repairTypeColorMap: Record<string, string> = {
  EMERGENCY: 'red',
  PREVENTIVE: 'blue',
  INSPECTION: 'cyan',
  ANDON: 'orange',
  OTHER: 'default',
};

/**
 * 格式化状态显示。
 * @param {string} status - 状态编码
 * @returns {string} 状态中文名称
 * @since 2026-05-14 08:41:00
 */
function formatStatus(status: string) {
  const map: Record<string, string> = {
    DRAFT: $t('repair.repairOrder.draft'),
    PENDING: $t('repair.repairOrder.pending'),
    ASSIGNED: $t('repair.repairOrder.assigned'),
    PROCESSING: $t('repair.repairOrder.processing'),
    COMPLETED: $t('repair.repairOrder.completed'),
    CANCELLED: $t('repair.repairOrder.cancelled'),
  };
  return map[status] || status;
}

/**
 * 格式化报修类型显示。
 * @param {string} type - 报修类型编码
 * @returns {string} 报修类型中文名称
 * @since 2026-05-14 08:41:00
 */
function formatRepairType(type: string) {
  const map: Record<string, string> = {
    EMERGENCY: $t('repair.repairOrder.emergencyStop'),
    PREVENTIVE: $t('repair.repairOrder.preventive'),
    INSPECTION: $t('repair.repairOrder.inspection'),
    ANDON: $t('repair.repairOrder.andon'),
    OTHER: $t('repair.repairOrder.other'),
  };
  return map[type] || type;
}

/**
 * 格式化紧急程度显示。
 * @param {string} level - 紧急程度编码
 * @returns {string} 紧急程度中文名称
 * @since 2026-05-14 08:41:00
 */
function formatUrgentLevel(level: string) {
  const map: Record<string, string> = {
    NORMAL: $t('repair.repairOrder.normal'),
    URGENT: $t('repair.repairOrder.urgent'),
    CRITICAL: $t('repair.repairOrder.critical'),
  };
  return map[level] || level;
}

// ========== 详情抽屉 ==========
/** 详情抽屉显示状态 */
const detailDrawerVisible = ref(false);
/** 详情报修单ID */
const detailRequestId = ref<number | undefined>(undefined);

/**
 * 打开详情抽屉。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
function handleDetail(row: any) {
  detailRequestId.value = row.id;
  detailDrawerVisible.value = true;
}

// ========== 报修单申请抽屉 ==========
/** 报修单申请抽屉显示状态 */
const repairRequestDrawerVisible = ref(false);
/** 编辑时的报修单ID */
const editingRepairId = ref<number | undefined>(undefined);

/**
 * 打开报修单申请抽屉（新增模式）。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function openRepairRequestDrawer() {
  editingRepairId.value = undefined;
  repairRequestDrawerVisible.value = true;
}

/**
 * 打开报修单编辑抽屉。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-05-14 10:30:00
 */
function openEditRepairDrawer(row: any) {
  editingRepairId.value = row.id;
  repairRequestDrawerVisible.value = true;
}

/**
 * 报修单申请成功后刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:52:00
 */
function handleRepairSuccess() {
  gridApi.reload();
}

// ========== 取消报修单 ==========
/** 取消抽屉显示状态 */
const cancelDrawerVisible = ref(false);
/** 当前取消的行数据 */
const cancelRow = ref<any>(null);
/** 取消原因 */
const cancelReason = ref('');

/**
 * 打开取消抽屉。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
function openCancelDrawer(row: any) {
  cancelRow.value = row;
  cancelReason.value = '';
  cancelDrawerVisible.value = true;
}

/**
 * 确认取消报修单。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
async function handleConfirmCancel() {
  if (!cancelReason.value.trim()) {
    message.error($t('repair.repairOrder.cancelReasonRequired'));
    return;
  }
  try {
    await cancelRepairRequest(cancelRow.value.id, cancelReason.value);
    message.success($t('common.successfulOperation'));
    cancelDrawerVisible.value = false;
    gridApi.reload();
  } catch {
    message.error($t('common.operationFailed'));
  }
}

// ========== 表格配置 ==========
/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('repair.repairTaskDetail.seq') },
    {
      field: 'requestNo',
      title: $t('repair.repairOrder.requestNo'),
      minWidth: 160,
    },
    {
      field: 'equipmentCode',
      title: $t('repair.repairOrder.equipmentCode'),
      minWidth: 120,
    },
    {
      field: 'equipmentName',
      title: $t('repair.repairOrder.equipmentName'),
      minWidth: 150,
    },
    {
      field: 'repairType',
      title: $t('repair.repairOrder.repairType'),
      minWidth: 120,
      slots: { default: 'repairType' },
    },
    {
      field: 'urgentLevel',
      title: $t('repair.repairOrder.urgentLevel'),
      minWidth: 100,
      slots: { default: 'urgentLevel' },
    },
    {
      field: 'faultName',
      title: $t('repair.repairOrder.faultName'),
      minWidth: 120,
    },
    {
      field: 'reportTime',
      title: $t('repair.repairOrder.reportTime'),
      minWidth: 160,
    },
    {
      field: 'status',
      title: $t('common.status'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'action',
      title: $t('common.action'),
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

/** VXE Grid 事件监听配置 */
const gridEvents: VxeGridListeners<any> = {};

/** VXE Grid 组件实例及 API */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 查询报修单列表数据。
 * @param pageNum - 页码
 * @param pageSize - 每页条数
 * @returns 包含总数和数据列表的 Promise
 * @since 2026-05-14 08:41:00
 */
function queryData({ pageNum, pageSize }: { pageNum: number; pageSize: number }) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };
    getRepairRequestPageList(params)
      .then(({ results, total }: any) => {
        const list = Array.isArray(results) ? results : [];
        resolve({
          total: total || 0,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// ========== 操作 ==========
/**
 * 处理重置按钮点击，重置查询参数并刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
function handleReset() {
  queryParams.value = {
    requestNo: undefined,
    equipmentCode: undefined,
    equipmentName: undefined,
    status: undefined,
    repairType: undefined,
  };
  gridApi.reload();
}

// ========== 权限 ==========
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表 */
const author = ref<string[]>([]);

/**
 * 组件挂载时执行初始化。
 * @returns {void} 无返回值。
 * @since 2026-05-14 08:41:00
 */
onMounted(async () => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  await initOptions();
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 报修单号 -->
        <FormItem :label="$t('repair.repairOrder.requestNo')" style="margin-bottom: 0">
          <Input
            v-model:value="queryParams.requestNo"
            :placeholder="$t('repair.repairOrder.requestNoPlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 设备编码 -->
        <FormItem :label="$t('repair.repairOrder.equipmentCode')" style="margin-bottom: 0">
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('repair.repairOrder.equipmentCodePlaceholder')"
            allow-clear
            style="width: 120px"
          />
        </FormItem>

        <!-- 设备名称 -->
        <FormItem :label="$t('repair.repairOrder.equipmentName')" style="margin-bottom: 0">
          <Input
            v-model:value="queryParams.equipmentName"
            :placeholder="$t('repair.repairOrder.equipmentNamePlaceholder')"
            allow-clear
            style="width: 150px"
          />
        </FormItem>

        <!-- 状态 -->
        <FormItem :label="$t('common.status')" style="margin-bottom: 0">
          <Select
            v-model:value="queryParams.status"
            :placeholder="$t('repair.repairOrder.statusPlaceholder')"
            allow-clear
            style="width: 120px"
            :options="statusOptions"
          />
        </FormItem>

        <!-- 报修类型 -->
        <FormItem :label="$t('repair.repairOrder.repairType')" style="margin-bottom: 0">
          <Select
            v-model:value="queryParams.repairType"
            :placeholder="$t('repair.repairOrder.repairTypePlaceholder')"
            allow-clear
            style="width: 140px"
            :options="repairTypeOptions"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 0">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 0">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
      <!-- 表格工具栏工具区域，显示切换和添加按钮 -->
      <template #toolbar-tools>
        <Space>
          <Button
            v-if="author.includes('新增')"
            type="primary"
            @click="openRepairRequestDrawer"
          >
            <Icon icon="mdi:plus" class="inline-block align-middle" />
            {{ $t('repair.repairOrder.add') }}
          </Button>
        </Space>
      </template>
        <template #repairType="{ row }">
          <Tag :color="repairTypeColorMap[row.repairType] || 'default'">
            {{ formatRepairType(row.repairType) }}
          </Tag>
        </template>
        <template #urgentLevel="{ row }">
          <Tag :color="row.urgentLevel === 'CRITICAL' ? 'red' : row.urgentLevel === 'URGENT' ? 'orange' : 'default'">
            {{ formatUrgentLevel(row.urgentLevel) }}
          </Tag>
        </template>
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.status] || 'default'">
            {{ formatStatus(row.status) }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('repair.repairOrder.detail') }}</template>
              <Button type="link" @click="handleDetail(row)" class="px-1">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('编辑') && (row.status === 'DRAFT' || row.status === 'CANCELLED')">
              <template #title>{{ $t('common.edit') }}</template>
              <Button type="link" @click="openEditRepairDrawer(row)" class="px-1">
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('取消') && row.status === 'PENDING'">
              <template #title>{{ $t('repair.repairOrder.cancel') }}</template>
              <Button type="link" danger @click="openCancelDrawer(row)" class="px-1">
                <Icon
                  icon="mdi:close-circle-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <RepairRequestDetailDrawer
      v-model:visible="detailDrawerVisible"
      :request-id="detailRequestId"
    />

    <!-- 取消抽屉 -->
    <Drawer
      v-model:open="cancelDrawerVisible"
      :title="$t('repair.repairOrder.cancel')"
      width="400"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <Form layout="vertical">
        <FormItem :label="$t('repair.repairOrder.cancelReason')">
          <Input
            v-model:value="cancelReason"
            type="text"
            :placeholder="$t('repair.repairOrder.cancelReasonPlaceholder')"
            :rows="3"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Space>
          <Button @click="cancelDrawerVisible = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button type="primary" @click="handleConfirmCancel">
            {{ $t('common.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 报修单申请抽屉 -->
    <RepairRequestDrawer
      v-model:visible="repairRequestDrawerVisible"
      :edit-id="editingRepairId"
      @success="handleRepairSuccess"
    />
  </Page>
</template>
