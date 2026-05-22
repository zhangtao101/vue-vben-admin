<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 maintenanceTask API
 * [OUTPUT]: 对外提供模具保养任务页面组件
 * [POS]: 设备管理模块 的模具保养任务页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-21 10:15:00
 */
import type { Dayjs } from 'dayjs';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type {
  MaintenanceExecuteParams,
  MaintenanceResult,
  MaintenanceTaskPageParams,
  MaintenanceTaskRecord,
} from '#/api/equipManagement/maintenanceTask.service';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  executeMaintenance,
  getMaintenanceTaskDetail,
  getMaintenanceTaskPage,
  verifyMaintenance,
} from '#/api/equipManagement/maintenanceTask.service';
import { $t } from '#/locales';

// ========== 任务列表查询参数 ==========
const taskQueryParams = ref<{
  currentStatus: string | undefined;
  maintenanceNo: string | undefined;
  moldCode: string | undefined;
  status: string | undefined;
}>({
  maintenanceNo: undefined,
  moldCode: undefined,
  status: undefined,
  currentStatus: undefined,
});

// ========== 下拉选项 ==========
const taskStatusOptions = [
  { label: $t('maintenanceTask.taskStatusPending'), value: 'PENDING_EXECUTE' },
  { label: $t('maintenanceTask.taskStatusVerify'), value: 'PENDING' },
  { label: $t('maintenanceTask.taskStatusCompleted'), value: 'COMPLETED' },
];

const moldCurrentStatusOptions = [
  { label: $t('maintenanceTask.moldCurrentStatusInUse'), value: 'IN_USE' },
  {
    label: $t('maintenanceTask.moldCurrentStatusInStorage'),
    value: 'IN_STORAGE',
  },
];

const resultOptions = [
  { label: $t('maintenanceTask.resultFail'), value: 'FAIL' },
  { label: $t('maintenanceTask.resultSuccess'), value: 'SUCCESS' },
];

const verifyResultOptions = [
  { label: $t('maintenanceTask.verifyFail'), value: 'FAIL' },
  { label: $t('maintenanceTask.verifyPass'), value: 'PASS' },
];

// ========== 任务列表表格配置 ==========
const taskGridOptions: VxeGridProps<MaintenanceTaskRecord> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    {
      field: 'maintenanceNo',
      title: $t('maintenanceTask.maintenanceNo'),
      minWidth: 140,
    },
    {
      field: 'moldCode',
      title: $t('maintenanceTask.moldCode'),
      minWidth: 120,
    },
    {
      field: 'moldName',
      title: $t('maintenanceTask.moldName'),
      minWidth: 140,
    },
    {
      field: 'planName',
      title: $t('maintenanceTask.planName'),
      minWidth: 140,
    },
    {
      field: 'statusName',
      title: $t('maintenanceTask.taskStatus'),
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'currentStatusName',
      title: $t('maintenanceTask.moldCurrentStatus'),
      minWidth: 100,
    },
    {
      field: 'remainingLifespan',
      title: $t('maintenanceTask.remainingLifespan'),
      minWidth: 100,
      slots: { default: 'lifespan' },
    },
    {
      field: 'action',
      title: $t('maintenanceTask.action'),
      width: 160,
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
        return await queryTaskData({
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

const taskGridEvents: VxeGridListeners<MaintenanceTaskRecord> = {};

const [TaskGrid, taskGridApi] = useVbenVxeGrid({
  gridEvents: taskGridEvents,
  gridOptions: taskGridOptions,
});

// ========== 数据查询 ==========
function queryTaskData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise<{ items: MaintenanceTaskRecord[]; total: number }>(
    (resolve) => {
      const params: MaintenanceTaskPageParams = {
        maintenanceNo: taskQueryParams.value.maintenanceNo,
        moldCode: taskQueryParams.value.moldCode,
        status: taskQueryParams.value.status as any,
        currentStatus: taskQueryParams.value.currentStatus as any,
        pageNum,
        pageSize,
      };

      getMaintenanceTaskPage(params)
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
 * 重置任务列表查询参数并刷新表格
 * @returns 无返回值
 * @since 2026-05-21 10:15:00
 */
function handleTaskReset() {
  taskQueryParams.value = {
    maintenanceNo: undefined,
    moldCode: undefined,
    status: undefined,
    currentStatus: undefined,
  };
  taskGridApi.reload();
}

// ========== 状态颜色映射 ==========
const taskStatusColorMap: Record<string, string> = {
  待保养: 'warning',
  待验收: 'processing',
  已完成: 'success',
};

// ========== 任务详情抽屉 ==========
const taskDetailVisible = ref(false);
const taskDetailData = ref<any>(null);

/**
 * 打开任务详情抽屉
 * @param row - 任务记录行数据，包含任务ID
 * @returns 无返回值，详情数据通过 getMaintenanceTaskDetail 接口获取
 * @throws 获取详情失败时显示错误提示
 * @since 2026-05-21 10:15:00
 */
function handleTaskDetail(row: MaintenanceTaskRecord) {
  getMaintenanceTaskDetail(row.id)
    .then((res: any) => {
      taskDetailData.value = res;
      taskDetailVisible.value = true;
    })
    .catch(() => {
      message.error($t('common.operationFailure'));
    });
}

// ========== 执行保养抽屉 ==========
const executeVisible = ref(false);
const executeLoading = ref(false);
const executeRow = ref<MaintenanceTaskRecord | null>(null);
const executeForm = ref({
  details: [] as {
    executeResult: string;
    id: number;
    isRequiredName: string;
    itemName: string;
    remark: string;
  }[],
  executeTime: undefined as Dayjs | undefined,
  maintenanceContent: '',
  maintenanceResult: 'SUCCESS' as MaintenanceResult,
  executeRemark: '',
});

/**
 * 打开执行保养抽屉并加载任务详情
 * @param row - 任务记录行数据，包含任务ID
 * @returns 无返回值，保养项目明细通过 getMaintenanceTaskDetail 接口获取
 * @throws 获取任务详情失败时显示错误提示
 * @since 2026-05-21 10:15:00
 */
function handleExecute(row: MaintenanceTaskRecord) {
  executeRow.value = row;
  executeForm.value = {
    details: [],
    executeTime: undefined,
    maintenanceContent: '',
    maintenanceResult: 'SUCCESS',
    executeRemark: '',
  };

  getMaintenanceTaskDetail(row.id)
    .then((res: any) => {
      executeForm.value.details = (res.details || []).map((item: any) => ({
        executeResult: '',
        id: item.id,
        isRequiredName: item.isRequiredName,
        itemName: item.itemName,
        remark: '',
      }));
      executeVisible.value = true;
    })
    .catch(() => {
      message.error($t('common.operationFailure'));
    });
}

/**
 * 提交执行保养表单
 * @returns 无返回值
 * @throws 保养时间未填时显示警告提示；提交失败时显示错误提示
 * @since 2026-05-21 10:15:00
 */
function handleExecuteSubmit() {
  if (!executeForm.value.executeTime) {
    message.warning(`${$t('maintenanceTask.executeTime')}不能为空`);
    return;
  }

  executeLoading.value = true;
  const params: MaintenanceExecuteParams = {
    recordId: executeRow.value?.id || 0,
    executeTime: executeForm.value.executeTime.format('YYYY-MM-DD HH:mm:ss'),
    maintenanceResult: executeForm.value.maintenanceResult,
    executeRemark: executeForm.value.executeRemark,
    maintenanceContent: executeForm.value.maintenanceContent,
    details: executeForm.value.details.map((item) => ({
      id: item.id,
      executeResult: item.executeResult,
      remark: item.remark,
    })),
  };

  executeMaintenance(params)
    .then(() => {
      message.success($t('maintenanceTask.executeSuccess'));
      executeVisible.value = false;
      taskGridApi.reload();
    })
    .catch(() => {
      message.error($t('common.operationFailed'));
    })
    .finally(() => {
      executeLoading.value = false;
    });
}

// ========== 验收抽屉 ==========
const verifyVisible = ref(false);
const verifyLoading = ref(false);
const verifyRow = ref<any>(null);
const verifyForm = ref({
  verificationResult: 'PASS' as MaintenanceResult,
  verifyComment: '',
  verifyRemark: '',
});

/**
 * 打开验收保养抽屉
 * @param row - 任务记录行数据，包含任务号和模具信息
 * @returns 无返回值
 * @since 2026-05-21 10:15:00
 */
function handleVerify(row: any) {
  verifyRow.value = row;
  verifyForm.value = {
    verificationResult: 'PASS' as MaintenanceResult,
    verifyComment: '',
    verifyRemark: '',
  };
  verifyVisible.value = true;
}

/**
 * 提交验收保养表单
 * @returns 无返回值
 * @throws 提交失败时显示错误提示
 * @since 2026-05-21 10:15:00
 */
function handleVerifySubmit() {
  verifyLoading.value = true;
  const params: any = {
    maintenanceNo: verifyRow.value?.maintenanceNo || '',
    verificationResult: verifyForm.value.verificationResult,
    verifyComment: verifyForm.value.verifyComment,
    verifyRemark: verifyForm.value.verifyRemark,
  };

  verifyMaintenance(params)
    .then(() => {
      message.success($t('maintenanceTask.verifySuccess'));
      verifyVisible.value = false;
      taskGridApi.reload();
    })
    .catch(() => {
      message.error($t('common.operationFailed'));
    })
    .finally(() => {
      verifyLoading.value = false;
    });
}
</script>

<template>
  <Page>
    <Card class="!mb-4">
      <Form :model="taskQueryParams" layout="inline">
        <!-- 任务号 -->
        <FormItem
          :label="$t('maintenanceTask.maintenanceNo')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="taskQueryParams.maintenanceNo"
            :placeholder="$t('maintenanceTask.maintenanceNoPlaceholder')"
            allow-clear
            style="width: 140px"
          />
        </FormItem>

        <!-- 模具编码/名称 -->
        <FormItem
          :label="$t('maintenanceTask.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="taskQueryParams.moldCode"
            :placeholder="$t('maintenanceTask.keywordPlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 任务状态 -->
        <FormItem
          :label="$t('maintenanceTask.taskStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="taskQueryParams.status"
            :placeholder="$t('maintenanceTask.taskStatusPlaceholder')"
            allow-clear
            :options="taskStatusOptions"
            style="width: 140px"
          />
        </FormItem>

        <!-- 模具状态 -->
        <FormItem
          :label="$t('maintenanceTask.moldCurrentStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="taskQueryParams.currentStatus"
            :placeholder="$t('maintenanceTask.moldCurrentStatusPlaceholder')"
            allow-clear
            :options="moldCurrentStatusOptions"
            style="width: 140px"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleTaskReset">
            {{ $t('maintenanceTask.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="taskGridApi.reload()">
            <Icon
              icon="mdi:magnify"
              class="inline-block align-middle text-base -mt-0.5"
            />
            {{ $t('maintenanceTask.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <!-- 任务列表 -->
      <TaskGrid>
        <template #toolbar-tools></template>
        <!-- 任务状态插槽 -->
        <template #status="{ row }">
          <Tag :color="taskStatusColorMap[row.statusName] || 'default'">
            {{ row.statusName }}
          </Tag>
        </template>

        <!-- 剩余寿命插槽 -->
        <template #lifespan="{ row }"> {{ row.remainingLifespan }}% </template>

        <!-- 操作插槽 -->
        <template #action="{ row }">
          <Space>
            <Tooltip>
              <template #title>{{ $t('common.view') }}</template>
              <Button type="link" @click="handleTaskDetail(row)" class="px-1">
                <Icon
                  icon="mdi:eye-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="row.status === 'PENDING_EXECUTE'">
              <template #title>{{ $t('maintenanceTask.execute') }}</template>
              <Button type="link" @click="handleExecute(row)" class="px-1">
                <Icon
                  icon="mdi:play-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
            <Tooltip v-if="row.status === 'PENDING'">
              <template #title>{{ $t('maintenanceTask.verify') }}</template>
              <Button type="link" @click="handleVerify(row)" class="px-1">
                <Icon
                  icon="mdi:check-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </TaskGrid>
    </Card>

    <!-- 任务详情抽屉 -->
    <Drawer
      v-model:open="taskDetailVisible"
      :title="$t('maintenanceTask.taskDetailTitle')"
      width="600"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="taskDetailData">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem :label="$t('maintenanceTask.maintenanceNo')">
            {{ taskDetailData.maintenanceNo }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.moldCode')">
            {{ taskDetailData.moldCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.moldName')">
            {{ taskDetailData.moldName }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.taskStatus')">
            {{ taskDetailData.statusName }}
          </DescriptionsItem>
        </Descriptions>
        <Divider>{{ $t('maintenanceTask.executeInfo') }}</Divider>
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem :label="$t('maintenanceTask.executedBy')">
            {{ taskDetailData.executedBy }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.executeTime')">
            {{ taskDetailData.executeEndTime }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.maintenanceResult')">
            {{ taskDetailData.maintenanceResultName || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.executeRemark')">
            {{ taskDetailData.executeRemark || '-' }}
          </DescriptionsItem>
        </Descriptions>
        <Divider>{{ $t('maintenanceTask.verifyInfo') }}</Divider>
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem :label="$t('maintenanceTask.verificationResult')">
            {{ taskDetailData.verificationResultName || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.verifiedBy')">
            {{ taskDetailData.verifiedBy || '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('maintenanceTask.verifiedTime')"
            :span="2"
          >
            {{ taskDetailData.verifiedTime || '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('maintenanceTask.verifyComment')"
            :span="2"
          >
            {{ taskDetailData.verifyComment || '-' }}
          </DescriptionsItem>
        </Descriptions>

        <Divider>{{ $t('maintenanceTask.action') }}</Divider>

        <Table
          :data-source="taskDetailData.details || []"
          :pagination="false"
          size="small"
        >
          <Table.Column title="#" data-index="sequenceNo" width="50" />
          <Table.Column
            :title="$t('maintenanceTask.itemName')"
            data-index="itemName"
          />
          <Table.Column :title="$t('maintenanceTask.executeResult')">
            <template #default="{ text }">
              <Tag
                :color="
                  text.executeResult === 'SUCCESS'
                    ? 'success'
                    : text.executeResult === 'FAIL'
                      ? 'error'
                      : 'default'
                "
              >
                {{
                  text.executeResult === 'SUCCESS'
                    ? $t('maintenanceTask.resultSuccess')
                    : text.executeResult === 'FAIL'
                      ? $t('maintenanceTask.resultFail')
                      : '-'
                }}
              </Tag>
            </template>
          </Table.Column>
          <Table.Column
            :title="$t('maintenanceTask.verifyRemark')"
            data-index="remark"
          />
        </Table>
      </div>
    </Drawer>

    <!-- 执行保养抽屉 -->
    <Drawer
      v-model:open="executeVisible"
      :title="$t('maintenanceTask.executeTitle')"
      width="700"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="executeRow">
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('maintenanceTask.maintenanceNo')">
              <Input :value="executeRow.maintenanceNo" disabled />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('maintenanceTask.moldCode')">
              <Input :value="executeRow.moldCode" disabled />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('maintenanceTask.executeTime')" class="!mb-4">
              <DatePicker
                v-model:value="executeForm.executeTime"
                format="YYYY-MM-DD HH:mm:ss"
                show-time
                style="width: 100%"
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem
              :label="$t('maintenanceTask.maintenanceResult')"
              class="!mb-4"
            >
              <Select
                v-model:value="executeForm.maintenanceResult"
                :options="resultOptions"
              />
            </FormItem>
          </Col>
        </Row>
        <FormItem :label="$t('maintenanceTask.executeRemark')" class="!mb-4">
          <Textarea v-model:value="executeForm.executeRemark" :rows="2" />
        </FormItem>

        <Divider>{{ $t('maintenanceTask.action') }}</Divider>

        <Table
          :data-source="executeForm.details"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, index, record }">
            <template v-if="column.dataIndex === 'sequenceNo'">
              <span>{{ index + 1 }}</span>
            </template>
            <template v-if="column.dataIndex === 'itemName'">
              {{ record.itemName }}
            </template>
            <template v-if="column.dataIndex === 'isRequiredName'">
              {{ record.isRequiredName }}
            </template>
            <template v-if="column.dataIndex === 'executeResult'">
              <Select
                v-model:value="record.executeResult"
                class="w-48"
                :options="resultOptions"
              />
            </template>
            <template v-if="column.dataIndex === 'remark'">
              <Input v-model:value="record.remark" />
            </template>
          </template>
          <Table.Column title="#" data-index="sequenceNo" width="50" />
          <Table.Column
            :title="$t('maintenanceTask.itemName')"
            data-index="itemName"
          />
          <Table.Column
            :title="$t('maintenanceTask.isRequired')"
            data-index="isRequiredName"
            width="80"
          />
          <Table.Column
            :title="$t('maintenanceTask.executeResult')"
            data-index="executeResult"
          />
          <Table.Column
            :title="$t('maintenanceTask.verifyRemark')"
            data-index="remark"
          />
        </Table>
      </div>

      <template #footer>
        <Space>
          <Button @click="executeVisible = false">
            {{ $t('maintenanceTask.cancel') }}
          </Button>
          <Button
            type="primary"
            :loading="executeLoading"
            @click="handleExecuteSubmit"
          >
            {{ $t('maintenanceTask.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 验收抽屉 -->
    <Drawer
      v-model:open="verifyVisible"
      :title="$t('maintenanceTask.verifyTitle')"
      width="500"
      :destroy-on-close="true"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="verifyRow">
        <Row :gutter="16">
          <Col :span="12">
            <FormItem :label="$t('maintenanceTask.maintenanceNo')">
              <Input :value="verifyRow.maintenanceNo" disabled />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem :label="$t('maintenanceTask.moldCode')">
              <Input :value="verifyRow.moldCode" disabled />
            </FormItem>
          </Col>
        </Row>
        <FormItem :label="$t('maintenanceTask.verifyResult')" class="!mb-4">
          <Select
            v-model:value="verifyForm.verificationResult"
            :options="verifyResultOptions"
          />
        </FormItem>
        <FormItem :label="$t('maintenanceTask.verifyComment')" class="!mb-4">
          <Textarea v-model:value="verifyForm.verifyComment" :rows="2" />
        </FormItem>
        <FormItem :label="$t('maintenanceTask.verifyRemark')" class="!mb-4">
          <Textarea v-model:value="verifyForm.verifyRemark" :rows="2" />
        </FormItem>
      </div>

      <template #footer>
        <Space>
          <Button @click="verifyVisible = false">
            {{ $t('maintenanceTask.cancel') }}
          </Button>
          <Button
            type="primary"
            :loading="verifyLoading"
            @click="handleVerifySubmit"
          >
            {{ $t('maintenanceTask.confirm') }}
          </Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>
