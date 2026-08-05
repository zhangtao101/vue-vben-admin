<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、orderHall.service API
 * [OUTPUT]: 对外提供接单大厅页面组件，含指标卡片、任务列表查询、详情查看、接单/指派/撤回功能
 * [POS]: 设备管理-维修维护模块 的接单大厅页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-04 09:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  assignOrderHallRepairTask,
  claimOrderHallTask,
  getOrderHallTaskCounts,
  getOrderHallTaskDetail,
  getOrderHallTaskList,
  withdrawOrderHallRepairTask,
} from '#/api/equipManagement/orderHall.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// ==================== 权限 ====================
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表 */
const author = ref<string[]>([]);

// ==================== 查询参数 ====================
/** 接单大厅查询参数 */
const queryParams = reactive({
  keyword: undefined as string | undefined,
  status: 1 as number | undefined,
  taskType: 'REPAIR' as string,
});

// ==================== 指标数据 ====================
/** 三类任务数量，从 getOrderHallTaskCounts 接口获取 */
const metricCounts = reactive({
  repair: 0,
  inspection: 0,
  maintenance: 0,
});

/** 任务类型与 i18n key 的映射 */
const taskTypeLabelMap: Record<string, string> = {
  INSPECTION: 'repair.orderHall.taskTypeInspection',
  MAINTENANCE: 'repair.orderHall.taskTypeMaintenance',
  REPAIR: 'repair.orderHall.taskTypeRepair',
};

// ==================== 颜色映射 ====================
/** 任务类型颜色映射 */
const taskTypeColorMap: Record<string, string> = {
  INSPECTION: '#1890ff',
  MAINTENANCE: '#52c41a',
  REPAIR: '#ff4d4f',
};

/** 状态颜色映射，基于 statusCode */
const statusColorMap: Record<string, string> = {
  1: 'warning',
  2: 'processing',
  3: 'warning',
  4: 'success',
  5: 'default',
  0: 'default',
};

// ==================== 格式化函数 ====================
/**
 * 格式化任务类型显示。
 * @param {string} type - 任务类型编码
 * @returns {string} 任务类型中文名称
 * @since 2026-08-04 09:00:00
 */
function formatTaskType(type: string) {
  const key = taskTypeLabelMap[type];
  return key ? $t(key) : type;
}

// ==================== 详情抽屉 ====================
/** 详情抽屉显示状态 */
const detailDrawerVisible = ref(false);
/** 详情数据加载状态 */
const detailLoading = ref(false);
/** 详情数据 */
const detailData = ref<any>(null);
/** 当前查看任务的 taskType */
const detailTaskType = ref('');

/** 任务明细 Ant Design Table 列定义 */
const itemTableColumns = computed(() => [
  { title: $t('repair.orderHall.itemName'), dataIndex: 'itemName', key: 'itemName', ellipsis: true },
  { title: $t('repair.orderHall.requirement'), dataIndex: 'requirement', key: 'requirement', ellipsis: true },
  { title: $t('repair.orderHall.standard'), dataIndex: 'standard', key: 'standard', ellipsis: true },
  { title: $t('repair.orderHall.result'), dataIndex: 'result', key: 'result', ellipsis: true, customRender: ({ text }: { text: number }) => formatResult(text) },
  { title: $t('repair.orderHall.remark'), dataIndex: 'remark', key: 'remark', ellipsis: true },
]);

/** 执行结果格式化：0未执行，1成功，2失败 */
function formatResult(val: number) {
  const map: Record<number, string> = {
    0: $t('repair.orderHall.resultNotExecuted'),
    1: $t('repair.orderHall.resultSuccess'),
    2: $t('repair.orderHall.resultFailed'),
  };
  return map[val] ?? val;
}

/**
 * 打开详情抽屉。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleViewDetail(row: any) {
  detailDrawerVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  detailTaskType.value = row.taskType;
  getOrderHallTaskDetail({
    taskId: row.id || row.taskId,
    taskType: row.taskType,
  })
    .then((res: any) => {
      detailData.value = res;
    })
    .catch(() => {
      message.error($t('repair.orderHall.getDetailFailed'));
    })
    .finally(() => {
      detailLoading.value = false;
    });
}

// ==================== 指派弹窗 ====================
/** 指派弹窗显示状态 */
const assignModalVisible = ref(false);
/** 指派弹窗加载状态 */
const assignModalLoading = ref(false);
/** 当前指派的维修任务数据库主键 */
const assignTaskId = ref<number>(0);
/** 指派对象工号 */
const assignAssignedTo = ref('');

/**
 * 打开指派弹窗。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleAssign(row: any) {
  assignTaskId.value = Number(row.id || row.taskId);
  assignAssignedTo.value = '';
  assignModalVisible.value = true;
}

/**
 * 确认指派人。
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function confirmAssign() {
  if (!assignAssignedTo.value.trim()) {
    message.error($t('repair.orderHall.assignRepairByRequired'));
    return;
  }
  assignModalLoading.value = true;
  assignOrderHallRepairTask({
    assignedTo: assignAssignedTo.value,
    taskId: assignTaskId.value,
  })
    .then(() => {
      message.success($t('repair.orderHall.assignSuccess'));
      assignModalVisible.value = false;
      gridApi.reload();
      fetchMetricCounts();
    })
    .catch(() => {
      message.error($t('repair.orderHall.assignFailed'));
    })
    .finally(() => {
      assignModalLoading.value = false;
    });
}

// ==================== 操作按钮 ====================
/**
 * 接单或领取任务。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleClaim(row: any) {
  claimOrderHallTask({
    taskId: row.id || row.taskId,
    taskType: row.taskType,
  })
    .then(() => {
      message.success($t('repair.orderHall.receiveSuccess'));
      gridApi.reload();
      fetchMetricCounts();
    })
    .catch(() => {
      message.error($t('repair.orderHall.receiveFailed'));
    });
}

/**
 * 撤回报修任务。
 * @param {any} row - 行数据
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleWithdraw(row: any) {
  withdrawOrderHallRepairTask(Number(row.id || row.taskId))
    .then(() => {
      message.success($t('repair.orderHall.withdrawSuccess'));
      gridApi.reload();
      fetchMetricCounts();
    })
    .catch(() => {
      message.error($t('repair.orderHall.withdrawFailed'));
    });
}

// ==================== 表格配置 ====================
/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('repair.repairTaskDetail.seq') },
    {
      field: 'taskNo',
      title: $t('repair.orderHall.taskNo'),
      minWidth: 160,
    },
    {
      field: 'taskName',
      title: $t('repair.orderHall.taskName'),
      minWidth: 200,
    },
    {
      field: 'taskType',
      title: $t('repair.orderHall.taskType'),
      minWidth: 120,
      slots: { default: 'taskType' },
    },
    {
      field: 'equipmentCode',
      title: $t('repair.orderHall.equipmentCode'),
      minWidth: 140,
    },
    {
      field: 'equipmentName',
      title: $t('repair.orderHall.equipmentName'),
      minWidth: 160,
    },
    {
      field: 'source',
      title: $t('repair.orderHall.source'),
      minWidth: 120,
    },
    {
      field: 'status',
      title: $t('common.status'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'createBy',
      title: $t('repair.orderHall.createBy'),
      minWidth: 120,
    },
    {
      field: 'createTime',
      title: $t('repair.orderHall.createTime'),
      minWidth: 160,
    },
    {
      field: 'action',
      title: $t('common.action'),
      width: 240,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: ({ page }: any) => {
        return queryListData({
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

// ==================== 数据获取 ====================
/**
 * 获取三类任务指标数量。
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function fetchMetricCounts() {
  getOrderHallTaskCounts()
    .then((res: any) => {
      if (res) {
        metricCounts.repair = res.REPAIR ?? 0;
        metricCounts.inspection = res.INSPECTION ?? 0;
        metricCounts.maintenance = res.MAINTENANCE ?? 0;
      }
    })
    .catch(() => {
      metricCounts.repair = 0;
      metricCounts.inspection = 0;
      metricCounts.maintenance = 0;
    });
}

/**
 * 查询任务列表数据。
 * @param pageNum - 页码
 * @param pageSize - 每页条数
 * @returns 包含总数和数据列表的 Promise
 * @since 2026-08-04 09:00:00
 */
function queryListData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve, reject) => {
    const params: any = {
      pageNum,
      pageSize,
      taskType: queryParams.taskType,
    };
    if (queryParams.keyword) {
      params.keyword = queryParams.keyword;
    }
    if (queryParams.status !== undefined) {
      params.status = queryParams.status;
    }
    getOrderHallTaskList(params)
      .then(({ results, total }: any) => {
        const list = Array.isArray(results) ? results : [];
        resolve({
          items: list,
          total: total || 0,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// ==================== 搜索操作 ====================
/**
 * 指标卡片点击，按任务类型筛选或取消筛选。
 * @param {string} type - 任务类型编码 REPAIR / INSPECTION / MAINTENANCE
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleMetricClick(type: string) {
  queryParams.taskType = queryParams.taskType === type ? '' : type;
  gridApi.reload();
}

/**
 * 重置查询参数并刷新表格。
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
function handleReset() {
  queryParams.keyword = undefined;
  queryParams.status = 1;
  // queryParams.taskType = 'REPAIR';
  gridApi.reload();
}

// ==================== 初始化 ====================
/**
 * 组件挂载时获取指标数据。
 * @returns {void} 无返回值。
 * @since 2026-08-04 09:00:00
 */
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  fetchMetricCounts();
});
</script>

<template>
  <Page>
    <!-- 指标卡片 -->
    <Card class="!mb-4">
      <div class="flex gap-4">
        <div
          class="metric-item cursor-pointer flex-1"
          :class="{ active: queryParams.taskType === 'REPAIR' }"
          @click="handleMetricClick('REPAIR')"
        >
          <div class="metric-icon repair-icon">
            <Icon icon="mdi:tools" class="h-6 w-6 text-white" />
          </div>
          <div class="metric-content">
            <div class="metric-label">
              {{ $t('repair.orderHall.repairTaskCount') }}
            </div>
            <div class="metric-value">{{ metricCounts.repair }}</div>
          </div>
        </div>
        <div
          class="metric-item cursor-pointer flex-1"
          :class="{ active: queryParams.taskType === 'INSPECTION' }"
          @click="handleMetricClick('INSPECTION')"
        >
          <div class="metric-icon inspection-icon">
            <Icon icon="mdi:magnify" class="h-6 w-6 text-white" />
          </div>
          <div class="metric-content">
            <div class="metric-label">
              {{ $t('repair.orderHall.inspectionTaskCount') }}
            </div>
            <div class="metric-value">{{ metricCounts.inspection }}</div>
          </div>
        </div>
        <div
          class="metric-item cursor-pointer flex-1"
          :class="{ active: queryParams.taskType === 'MAINTENANCE' }"
          @click="handleMetricClick('MAINTENANCE')"
        >
          <div class="metric-icon maintenance-icon">
            <Icon icon="mdi:cog" class="h-6 w-6 text-white" />
          </div>
          <div class="metric-content">
            <div class="metric-label">
              {{ $t('repair.orderHall.maintenanceTaskCount') }}
            </div>
            <div class="metric-value">{{ metricCounts.maintenance }}</div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('repair.orderHall.keyword')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.keyword"
            :placeholder="$t('repair.orderHall.keywordPlaceholder')"
            allow-clear
            style="width: 280px"
            @press-enter="gridApi.reload()"
          />
        </FormItem>

        <FormItem
          :label="$t('repair.orderHall.status')"
          style="margin-bottom: 0"
        >
          <Radio.Group v-model:value="queryParams.status" @change="gridApi.reload()">
            <Radio.Button :value="1">{{ $t('repair.orderHall.statusInProgress') }}</Radio.Button>
            <Radio.Button :value="2">{{ $t('repair.orderHall.statusCompleted') }}</Radio.Button>
          </Radio.Group>
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Button type="primary" @click="gridApi.reload()">
            {{ $t('common.search') }}
          </Button>
        </FormItem>

        <FormItem style="margin-bottom: 0">
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-tools></template>
        <template #taskType="{ row }">
          <Tag :color="taskTypeColorMap[row.taskType] || 'default'">
            {{ formatTaskType(row.taskType) }}
          </Tag>
        </template>
        <template #status="{ row }">
          <Tag :color="statusColorMap[row.statusCode] || 'default'">
            {{ row.statusName || '-' }}
          </Tag>
        </template>
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('repair.orderHall.detail') }}</template>
              <Button type="link" size="small" class="!px-1" @click="handleViewDetail(row)">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="author.includes('领取') && row.status?.statusCode === 1">
              <template #title>{{ $t('repair.orderHall.receive') }}</template>
              <Button type="link" size="small" class="!px-1" @click="handleClaim(row)">
                <Icon
                  icon="mdi:hand-extended-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Tooltip
              v-if="
                author.includes('分配') &&
                row.status?.statusCode === 1 &&
                row.taskType === 'REPAIR'
              "
            >
              <template #title>{{ $t('repair.orderHall.assign') }}</template>
              <Button type="link" size="small" class="!px-1" @click="handleAssign(row)">
                <Icon
                  icon="mdi:account-arrow-right-outline"
                  class="inline-block align-middle text-2xl"
                />
              </Button>
            </Tooltip>
            <Popconfirm
              v-if="
                author.includes('撤回') &&
                (row.status?.statusCode === 2 || row.status?.statusCode === 3)
              "
              :title="$t('repair.orderHall.withdrawConfirm')"
              @confirm="handleWithdraw(row)"
            >
              <Tooltip>
                <template #title>{{ $t('repair.orderHall.withdraw') }}</template>
                <Button type="link" danger size="small" class="!px-1">
                  <Icon
                    icon="mdi:undo-variant"
                    class="inline-block align-middle text-2xl"
                  />
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailDrawerVisible"
      :title="$t('repair.orderHall.detailTitle')"
      placement="top"
      height="60%"
      :destroy-on-close="true"
    >
      <Spin :spinning="detailLoading">
        <template v-if="detailData">
          <Descriptions
            :title="$t('repair.orderHall.basicInfo')"
            :column="2"
            bordered
            size="small"
          >
            <DescriptionsItem :label="$t('repair.orderHall.taskNo')">
              {{ detailData.taskNo }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.taskName')">
              {{ detailData.taskName }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.taskType')">
              <Tag :color="taskTypeColorMap[detailData.taskType] || 'default'">
                {{ formatTaskType(detailData.taskType) }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.source')">
              {{ detailData.taskSource }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.equipmentCode')">
              {{ detailData.equipmentCode }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.equipmentName')">
              {{ detailData.equipmentName }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.taskTime')">
              {{ detailData.taskTime }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('common.status')">
              <Tag :color="statusColorMap[detailData.statusCode] || 'default'">
                {{ detailData.statusName || '-' }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.operator')">
              {{ detailData.operator || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.orderHall.taskResult')">
              {{ detailData.result || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.reporter')"
            >
              {{ detailData.reporter || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.urgentLevel')"
            >
              {{ detailData.urgentLevel || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.faultName')"
            >
              {{ detailData.faultName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.faultCause')"
            >
              {{ detailData.faultCause || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.startTime')"
            >
              {{ detailData.startTime || '-' }}
            </DescriptionsItem>
            <DescriptionsItem
              v-if="detailData.taskType === 'REPAIR'"
              :label="$t('repair.orderHall.completedTime')"
            >
              {{ detailData.completedTime || '-' }}
            </DescriptionsItem>
          </Descriptions>
          <template v-if="detailData.items && detailData.items.length > 0">
            <div class="mb-2 mt-4 text-sm font-medium" style="color: var(--ant-color-text)">
              {{ $t('repair.orderHall.taskItems') }}
            </div>
            <Table
              :columns="itemTableColumns"
              :data-source="detailData.items"
              :pagination="false"
              size="small"
              bordered
            />
          </template>
        </template>
        <div v-else class="flex items-center justify-center py-20 text-gray-400">
          {{ $t('repair.orderHall.noData') }}
        </div>
      </Spin>
    </Drawer>

    <!-- 指派弹窗 -->
    <Modal
      v-model:open="assignModalVisible"
      :title="$t('repair.orderHall.assign')"
      :confirm-loading="assignModalLoading"
      @ok="confirmAssign"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <FormItem :label="$t('repair.orderHall.assignRepairBy')">
          <Input
            v-model:value="assignAssignedTo"
            :placeholder="$t('repair.orderHall.assignRepairByPlaceholder')"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

<style lang="less" scoped>
.metric-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
  background: var(--ant-color-bg-elevated);
  border: 2px solid transparent;

  &:hover {
    background: var(--ant-color-bg-layout);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  }

  &.active {
    border-color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }

  .metric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    margin-right: 16px;

    &.repair-icon {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
    }
    &.inspection-icon {
      background: linear-gradient(135deg, #1890ff, #40a9ff);
    }
    &.maintenance-icon {
      background: linear-gradient(135deg, #52c41a, #73d13d);
    }
  }

  .metric-content {
    flex: 1;

    .metric-label {
      font-size: 14px;
      color: var(--ant-color-text-secondary);
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 600;
      color: var(--ant-color-text);
    }
  }
}
</style>
