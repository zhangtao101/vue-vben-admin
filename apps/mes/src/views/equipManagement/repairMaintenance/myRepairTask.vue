<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue、vxe-table、repairTask.service API
 * [OUTPUT]: 对外提供我的维修任务列表页面，含维修任务查询、详情查看
 * [POS]: 维修维护模块 的我的维修任务页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-14 14:09:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';
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
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRepairTaskPageList } from '#/api';
import { getRepairBasicConfigList } from '#/api/equipManagement/repairBasicConfig.service';
import {
  assignRepairTask,
  claimRepairTask,
  getAssignableUsers,
  getRepairTaskById,
  pauseRepairTask,
  reportRepairTask,
  resumeRepairTask,
  transferRepairTask,
} from '#/api/equipManagement/repairTask.service';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import RepairTaskDetailDrawer from '#/util/component/repairMaintenance/RepairTaskDetailDrawer.vue';
import SparePartsSelectDrawer from '#/util/component/repairMaintenance/SparePartsSelectDrawer.vue';

// ========== 查询参数 ==========
/** 我的维修任务查询参数 */
const queryParams = ref({
  requestNo: undefined as string | undefined,
  equipmentCode: undefined as string | undefined,
  status: undefined as string | undefined,
});

// ========== 下拉选项 ==========
/** 状态下拉选项列表 */
const statusOptions = [
  { label: $t('repair.repairOrder.all'), value: '' },
  { label: $t('repair.repairOrder.waiting'), value: 'WAITING' },
  { label: $t('repair.repairOrder.processing'), value: 'PROCESSING' },
  { label: $t('repair.repairOrder.paused'), value: 'PAUSED' },
  { label: $t('repair.repairOrder.completed'), value: 'COMPLETED' },
];

// ========== 状态格式化 ==========
/** 状态颜色映射 */
const statusColorMap: Record<string, string> = {
  WAITING: 'warning',
  PROCESSING: 'processing',
  PAUSED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

/** 报修类型颜色映射 */
const repairTypeColorMap: Record<string, string> = {
  EMERGENCY: 'red',
  PREVENTIVE: 'blue',
  INSPECTION: 'cyan',
  ANDON: 'orange',
  DAILY: 'green',
  MAINTENANCE: 'purple',
  OTHER: 'default',
};

/**
 * 格式化状态显示。
 * @param {string} status - 状态编码
 * @returns {string} 状态中文名称
 */
function formatStatus(status: string) {
  const map: Record<string, string> = {
    WAITING: $t('repair.repairOrder.waiting'),
    PROCESSING: $t('repair.repairOrder.processing'),
    PAUSED: $t('repair.repairOrder.paused'),
    COMPLETED: $t('repair.repairOrder.completed'),
    CANCELLED: $t('repair.repairOrder.cancelled'),
  };
  return map[status] || status;
}

/**
 * 格式化报修类型显示。
 * @param {string} type - 报修类型编码
 * @returns {string} 报修类型中文名称
 */
function formatRepairType(type: string) {
  const map: Record<string, string> = {
    EMERGENCY: $t('repair.repairOrder.emergencyStop'),
    PREVENTIVE: $t('repair.repairOrder.preventive'),
    INSPECTION: $t('repair.repairOrder.inspection'),
    ANDON: $t('repair.repairOrder.andon'),
    DAILY: $t('repair.repairOrder.daily'),
    MAINTENANCE: $t('repair.repairOrder.maintenance'),
    OTHER: $t('repair.repairOrder.other'),
  };
  return map[type] || type;
}

/**
 * 格式化紧急程度显示。
 * @param {string} level - 紧急程度编码
 * @returns {string} 紧急程度中文名称
 */
function formatUrgentLevel(level: string) {
  const map: Record<string, string> = {
    NORMAL: $t('repair.repairOrder.normal'),
    HIGH: $t('repair.repairOrder.high'),
    URGENT: $t('repair.repairOrder.urgent'),
    CRITICAL: $t('repair.repairOrder.critical'),
  };
  return map[level] || level;
}

// ========== 详情抽屉 ==========
/** 详情抽屉显示状态 */
const detailDrawerVisible = ref(false);
/** 详情维修任务ID */
const detailTaskId = ref<number | undefined>(undefined);

/**
 * 打开详情抽屉。
 * @param {any} row - 行数据
 */
function handleDetail(row: any) {
  detailTaskId.value = row.id;
  detailDrawerVisible.value = true;
}

// ========== 表格配置 ==========
/** VXE Grid 表格配置对象 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('repair.repairTaskDetail.seq') },
    {
      field: 'repairNo',
      title: $t('repair.repairTask.repairNo'),
      minWidth: 200,
    },
    {
      field: 'requestNo',
      title: $t('repair.repairTask.requestNo'),
      minWidth: 200,
    },
    {
      field: 'equipmentCode',
      title: $t('repair.repairTask.equipmentCode'),
      minWidth: 120,
    },
    {
      field: 'equipmentName',
      title: $t('repair.repairTask.equipmentName'),
      minWidth: 150,
    },
    {
      field: 'repairType',
      title: $t('repair.repairTask.repairType'),
      minWidth: 120,
      slots: { default: 'repairType' },
    },
    {
      field: 'urgentLevel',
      title: $t('repair.repairTask.urgentLevel'),
      minWidth: 100,
      slots: { default: 'urgentLevel' },
    },
    {
      field: 'repairBy',
      title: $t('repair.repairTask.repairBy'),
      minWidth: 100,
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
      width: 300,
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
 * 查询维修任务列表数据。
 * @param pageNum - 页码
 * @param pageSize - 每页条数
 * @returns 包含总数和数据列表的 Promise
 */
function queryData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum,
      pageSize,
    };
    getRepairTaskPageList(params)
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
 */
function handleReset() {
  queryParams.value = {
    requestNo: undefined,
    equipmentCode: undefined,
    status: undefined,
  };
  gridApi.reload();
}

/**
 * 处理领取按钮点击。
 * @param {any} row - 行数据
 */
function handleReceive(row: any) {
  claimRepairTask(row.id).then(() => {
    message.success($t('common.successfulOperation'));
    gridApi.reload();
  });
}

// ========== 指派 ==========
/** 指派 Modal 显示状态 */
const assignModalVisible = ref(false);
/** 指派当前行数据 */
const assignCurrentRow = ref<any>(null);
/** 指派维修人 */
const assignRepairBy = ref('');
/** 指派用户选项 */
const assignUserOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 处理指派按钮点击。
 * @param {any} row - 行数据
 */
function handleAssign(row: any) {
  assignCurrentRow.value = row;
  assignRepairBy.value = '';
  // 获取可指派用户列表
  getAssignableUsers(row.id).then((data) => {
    assignUserOptions.value = data || [];
  });
  assignModalVisible.value = true;
}

/**
 * 确认指派。
 */
function confirmAssign() {
  if (!assignRepairBy.value) {
    message.error('请输入维修人');
    return;
  }
  assignRepairTask(assignCurrentRow.value.id, assignRepairBy.value)
    .then(() => {
      message.success('指派成功');
      assignModalVisible.value = false;
      gridApi.reload();
    })
    .catch(() => {
      message.error('指派失败');
    });
}

// ========== 暂停 ==========
/** 暂停 Modal 显示状态 */
const pauseModalVisible = ref(false);
/** 暂停当前行数据 */
const pauseCurrentRow = ref<any>(null);
/** 暂停原因 */
const pauseReason = ref('');

/**
 * 处理暂停按钮点击。
 * @param {any} row - 行数据
 */
function handlePause(row: any) {
  pauseCurrentRow.value = row;
  pauseReason.value = '';
  pauseModalVisible.value = true;
}

/**
 * 确认暂停。
 */
function confirmPause() {
  if (!pauseReason.value) {
    message.error('请输入暂停原因');
    return;
  }
  pauseRepairTask({
    taskId: pauseCurrentRow.value.id,
    pauseReason: pauseReason.value,
  })
    .then(() => {
      message.success('暂停成功');
      pauseModalVisible.value = false;
      gridApi.reload();
    })
    .catch(() => {
      message.error('暂停失败');
    });
}

// ========== 完成 ==========
/** 完成 Drawer 状态 */
const completeState = reactive({
  visible: false,
  loading: false,
  currentRow: null as any,
  detail: null as any,
  result: '',
  hasReplacedParts: false,
  replacedParts: [] as any[],
  rootCauseCategory: '',
  rootCauseDetail: '',
  repairMethod: '',
  content: '',
});

/** 配件选择抽屉状态 */
const sparePartsDrawerVisible = ref(false);
const sparePartsSelectedRows = ref<any[]>([]);

/** 维修结果选项 */
const repairResultOptions = [
  { label: '已修复', value: 'NORMAL' },
  { label: '部分修复', value: 'PARTIAL' },
  { label: '未修复', value: 'FAILED' },
];

/** 根因大类选项 */
const rootCauseOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 获取根因大类选项列表。
 */
function fetchRootCauseOptions() {
  getRepairBasicConfigList({
    configType: 'FAULT_ROOT_CAUSE',
    status: 'ACTIVE',
  }).then((data) => {
    rootCauseOptions.value = (data || []).map((item: any) => ({
      label: item.configName,
      value: item.configName,
    }));
  });
}

/**
 * 处理完成按钮点击。
 * @param {any} row - 行数据
 */
function handleComplete(row: any) {
  completeState.currentRow = row;
  completeState.loading = true;
  completeState.visible = true;
  // 获取详情数据
  getRepairTaskById(row.id)
    .then((data) => {
      completeState.detail = data;
      completeState.result = data.repairResult || '';
      completeState.hasReplacedParts = data.hasReplacedParts || false;
      // 如果有已选配件，解析为数组
      completeState.replacedParts = data.repairParts
        ? data.repairParts.split(',').map((s: string) => s.trim())
        : [];
      completeState.rootCauseCategory = data.faultName || '';
      completeState.rootCauseDetail = data.faultCode || '';
      completeState.repairMethod = data.repairMeasureName || '';
      completeState.content = data.repairContent || '';
    })
    .catch(() => {
      message.error('获取详情失败');
    })
    .finally(() => {
      completeState.loading = false;
    });
}

/**
 * 确认完成。
 */
function confirmComplete() {
  if (!completeState.result) {
    message.error('请选择维修结果');
    return;
  }
  if (!completeState.content) {
    message.error('请输入维修内容');
    return;
  }
  reportRepairTask({
    taskId: completeState.currentRow.id,
    repairResult: completeState.result,
    hasReplacedParts: completeState.hasReplacedParts,
    // 将配件数组转为逗号分隔的字符串
    replacedParts:
      completeState.replacedParts.length > 0
        ? completeState.replacedParts
            .map((r: any) => r.spareName || r)
            .join(',')
        : undefined,
    rootCauseCategory: completeState.rootCauseCategory || undefined,
    rootCauseDetail: completeState.rootCauseDetail || undefined,
    repairMethod: completeState.repairMethod || undefined,
    repairContent: completeState.content,
  })
    .then(() => {
      message.success('完成成功');
      completeState.visible = false;
      gridApi.reload();
    })
    .catch(() => {
      message.error('完成失败');
    });
}

// ========== 恢复 ==========
/** 恢复 Modal 显示状态 */
const resumeModalVisible = ref(false);
/** 恢复当前行数据 */
const resumeCurrentRow = ref<any>(null);
/** 恢复说明 */
const resumeRemark = ref('');

/**
 * 处理恢复按钮点击。
 * @param {any} row - 行数据
 */
function handleResume(row: any) {
  resumeCurrentRow.value = row;
  resumeRemark.value = '';
  resumeModalVisible.value = true;
}

/**
 * 确认恢复。
 */
function confirmResume() {
  resumeRepairTask(resumeCurrentRow.value.id, resumeRemark.value || undefined)
    .then(() => {
      message.success('恢复成功');
      resumeModalVisible.value = false;
      gridApi.reload();
    })
    .catch(() => {
      message.error('恢复失败');
    });
}

// ========== 转交 ==========
/** 转交 Modal 显示状态 */
const transferModalVisible = ref(false);
/** 转交当前行数据 */
const transferCurrentRow = ref<any>(null);
/** 转交人 */
const transferTo = ref('');
/** 转交原因 */
const transferReason = ref('');
/** 转交备注 */
const transferRemark = ref('');
/** 转交用户选项 */
const transferUserOptions = ref<{ label: string; value: string }[]>([]);

/**
 * 处理转交按钮点击。
 * @param {any} row - 行数据
 */
function handleTransfer(row: any) {
  transferCurrentRow.value = row;
  transferTo.value = '';
  transferReason.value = '';
  transferRemark.value = '';
  // 获取可转派用户列表（排除当前登录用户）
  getAssignableUsers(row.id, true).then((data) => {
    transferUserOptions.value = data || [];
  });
  transferModalVisible.value = true;
}

/**
 * 确认转交。
 */
function confirmTransfer() {
  if (!transferTo.value) {
    message.error('请输入转交人');
    return;
  }
  if (!transferReason.value) {
    message.error('请输入转交原因');
    return;
  }
  transferRepairTask({
    taskId: transferCurrentRow.value.id,
    transferTo: transferTo.value,
    transferReason: transferReason.value,
    remark: transferRemark.value,
  })
    .then(() => {
      message.success('转交成功');
      transferModalVisible.value = false;
      gridApi.reload();
    })
    .catch(() => {
      message.error('转交失败');
    });
}

// ========== 权限 ==========
/** 当前路由实例，用于获取权限码 */
const route = useRoute();
/** 按钮权限列表 */
const author = ref<string[]>([]);

/**
 * 组件挂载时执行初始化。
 */
onMounted(async () => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  // 获取根因大类选项
  fetchRootCauseOptions();
});
</script>

<template>
  <Page>
    <!-- 查询区域 -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <!-- 报修单号 -->
        <FormItem
          :label="$t('repair.repairTask.requestNo')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.requestNo"
            :placeholder="$t('repair.repairTask.requestNoPlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 设备编码 -->
        <FormItem
          :label="$t('repair.repairTask.equipmentCode')"
          style="margin-bottom: 0"
        >
          <Input
            v-model:value="queryParams.equipmentCode"
            :placeholder="$t('repair.repairTask.equipmentCodePlaceholder')"
            allow-clear
            style="width: 120px"
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
        <template #repairType="{ row }">
          <Tag :color="repairTypeColorMap[row.repairType] || 'default'">
            {{ formatRepairType(row.repairType) }}
          </Tag>
        </template>
        <template #urgentLevel="{ row }">
          <Tag
            :color="
              row.urgentLevel === 'CRITICAL'
                ? 'red'
                : row.urgentLevel === 'HIGH' || row.urgentLevel === 'URGENT'
                  ? 'orange'
                  : 'default'
            "
          >
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
            <!-- 查看详情 - 不需要权限，始终显示 -->
            <Tooltip>
              <template #title>{{ $t('repair.myRepairTask.detail') }}</template>
              <Button type="link" @click="handleDetail(row)" class="px-1">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-xl"
                />
              </Button>
            </Tooltip>

            <!-- 待领取状态：领取按钮 -->
            <template v-if="row.status === 'WAITING'">
              <Tooltip v-if="author.includes('领取')">
                <template #title>领取</template>
                <Button type="link" @click="handleReceive(row)" class="px-1">
                  <Icon
                    icon="mdi:hand-front-right-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
              <Tooltip v-if="author.includes('指派')">
                <template #title>指派</template>
                <Button type="link" @click="handleAssign(row)" class="px-1">
                  <Icon
                    icon="mdi:account-arrow-right-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
            </template>

            <!-- 处理中状态：暂停、完成、转交按钮 -->
            <template v-if="row.status === 'PROCESSING' && row.isCurrentUser">
              <Tooltip v-if="author.includes('暂停')">
                <template #title>
{{
                  $t('repair.myRepairTask.pause')
                }}
</template>
                <Button type="link" @click="handlePause(row)" class="px-1">
                  <Icon
                    icon="mdi:pause-circle-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
              <Tooltip v-if="author.includes('完成')">
                <template #title>
{{
                  $t('repair.myRepairTask.complete')
                }}
</template>
                <Button type="link" @click="handleComplete(row)" class="px-1">
                  <Icon
                    icon="mdi:check-circle-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
              <Tooltip v-if="author.includes('转交')">
                <template #title>
{{
                  $t('repair.myRepairTask.transfer')
                }}
</template>
                <Button type="link" @click="handleTransfer(row)" class="px-1">
                  <Icon
                    icon="mdi:account-switch-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
            </template>

            <!-- 暂停状态：恢复按钮 -->
            <template v-if="row.status === 'PAUSED' && row.isCurrentUser">
              <Tooltip v-if="author.includes('恢复')">
                <template #title>恢复</template>
                <Button type="link" @click="handleResume(row)" class="px-1">
                  <Icon
                    icon="mdi:play-circle-outline"
                    class="inline-block align-middle text-xl"
                  />
                </Button>
              </Tooltip>
            </template>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 详情抽屉 -->
    <RepairTaskDetailDrawer
      v-model:visible="detailDrawerVisible"
      :task-id="detailTaskId"
    />

    <!-- 指派 Modal -->
    <Modal
      v-model:open="assignModalVisible"
      :title="$t('repair.myRepairTask.assign')"
      @ok="confirmAssign"
    >
      <Form>
        <FormItem label="维修人" required>
          <Select
            v-model:value="assignRepairBy"
            placeholder="请选择维修人"
            :options="assignUserOptions"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 暂停 Modal -->
    <Modal
      v-model:open="pauseModalVisible"
      :title="$t('repair.myRepairTask.pause')"
      @ok="confirmPause"
    >
      <Form>
        <FormItem label="暂停原因" required>
          <Input v-model:value="pauseReason" placeholder="请输入暂停原因" />
        </FormItem>
      </Form>
    </Modal>

    <!-- 完成 Drawer -->
    <Drawer
      v-model:open="completeState.visible"
      :title="$t('repair.myRepairTask.complete')"
      width="800px"
      :closable="true"
      :mask-closable="false"
      :footer-style="{ textAlign: 'right' }"
      @close="completeState.visible = false"
    >
      <template v-if="completeState.loading">
        <div class="flex items-center justify-center h-64">
          <Spin />
        </div>
      </template>
      <template v-else-if="completeState.detail">
        <!-- 基本信息区域 - 不可编辑 -->
        <div class="mb-6">
          <div class="text-base font-medium mb-3 border-b pb-2">基本信息</div>
          <Descriptions :column="2" bordered size="small">
            <DescriptionsItem label="报修单号">
{{
              completeState.detail.requestNo || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="维修单号">
{{
              completeState.detail.repairNo || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="设备编码">
{{
              completeState.detail.equipmentCode || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="设备名称">
{{
              completeState.detail.equipmentName || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="报修类型">
{{
              completeState.detail.repairType || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="紧急程度">
{{
              completeState.detail.urgentLevel || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="报修人">
{{
              completeState.detail.reportBy || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="维修人">
{{
              completeState.detail.repairBy || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="故障名称">
{{
              completeState.detail.faultName || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="故障代码">
{{
              completeState.detail.faultCode || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="报修时间">
{{
              completeState.detail.reportTime || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="维修开始时间">
{{
              completeState.detail.repairStartTime || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="维修结束时间">
{{
              completeState.detail.repairEndTime || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="响应时长(分钟)">
{{
              completeState.detail.responseDuration || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="维修时长(分钟)">
{{
              completeState.detail.repairDuration || '-'
            }}
</DescriptionsItem>
            <DescriptionsItem label="暂停时长(分钟)">
{{
              completeState.detail.pauseDuration || '-'
            }}
</DescriptionsItem>
          </Descriptions>
        </div>

        <!-- 可编辑区域 -->
        <div>
          <div class="text-base font-medium mb-3 border-b pb-2">维修填报</div>
          <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
            <FormItem label="维修结果" required>
              <Select
                v-model:value="completeState.result"
                placeholder="请选择维修结果"
                :options="repairResultOptions"
              />
            </FormItem>
            <FormItem label="是否更换配件">
              <Switch v-model:checked="completeState.hasReplacedParts" />
            </FormItem>
            <FormItem v-if="completeState.hasReplacedParts" label="配件选择">
              <div class="flex items-center gap-2">
                <Input
                  :value="
                    completeState.replacedParts
                      .map((r: any) => r.spareName || r)
                      .join(', ')
                  "
                  placeholder="请选择配件"
                  readonly
                />
                <Button
                  type="primary"
                  @click="
                    sparePartsDrawerVisible = true;
                    sparePartsSelectedRows = [...completeState.replacedParts];
                  "
                >
                  选择配件
                </Button>
              </div>
            </FormItem>
            <FormItem label="根因大类">
              <Select
                v-model:value="completeState.rootCauseCategory"
                placeholder="请选择根因大类"
                :options="rootCauseOptions"
                allow-clear
              />
            </FormItem>
            <FormItem label="原因说明">
              <Input
                v-model:value="completeState.rootCauseDetail"
                placeholder="请输入原因说明"
              />
            </FormItem>
            <FormItem label="处理方式">
              <Input
                v-model:value="completeState.repairMethod"
                placeholder="请输入处理方式"
              />
            </FormItem>
            <FormItem label="维修内容" required>
              <Input.TextArea
                v-model:value="completeState.content"
                :rows="4"
                placeholder="请输入维修内容"
              />
            </FormItem>
          </Form>
        </div>
      </template>

      <template #footer>
        <Space>
          <Button @click="completeState.visible = false">取消</Button>
          <Button type="primary" @click="confirmComplete">确认完成</Button>
        </Space>
      </template>
    </Drawer>

    <!-- 配件选择抽屉 -->
    <SparePartsSelectDrawer
      v-model:visible="sparePartsDrawerVisible"
      :equipment-code="completeState.detail?.equipmentCode"
      :selected-rows="sparePartsSelectedRows"
      @confirm="
        (rows) => {
          completeState.replacedParts = rows;
        }
      "
    />

    <!-- 恢复 Modal -->
    <Modal
      v-model:open="resumeModalVisible"
      :title="$t('repair.myRepairTask.resume')"
      @ok="confirmResume"
    >
      <Form>
        <FormItem label="恢复说明">
          <Input.TextArea
            v-model:value="resumeRemark"
            :rows="2"
            placeholder="请输入恢复说明（可选）"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 转交 Modal -->
    <Modal
      v-model:open="transferModalVisible"
      :title="$t('repair.myRepairTask.transfer')"
      @ok="confirmTransfer"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <FormItem label="转交人" required>
          <Select
            v-model:value="transferTo"
            placeholder="请选择转交人"
            :options="transferUserOptions"
          />
        </FormItem>
        <FormItem label="转交原因" required>
          <Input.TextArea
            v-model:value="transferReason"
            :rows="2"
            placeholder="请输入转交原因"
          />
        </FormItem>
        <FormItem label="备注">
          <Input.TextArea
            v-model:value="transferRemark"
            :rows="2"
            placeholder="请输入备注（可选）"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
