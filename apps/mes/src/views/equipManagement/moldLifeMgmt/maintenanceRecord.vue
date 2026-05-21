<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 maintenanceTask API
 * [OUTPUT]: 对外提供模具保养记录页面组件
 * [POS]: 设备管理模块 的模具保养记录页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-21 10:15:00
 */

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';
import type {
  MaintenanceRecord,
  MaintenanceRecordDetail,
  MaintenanceRecordPageParams,
} from '#/api/equipManagement/maintenanceTask.service';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Form,
  FormItem,
  Input,
  message,
  RangePicker,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getMaintenanceRecordDetail,
  getMaintenanceRecordPage,
} from '#/api/equipManagement/maintenanceTask.service';
import { $t } from '#/locales';

// ========== 记录列表查询参数 ==========
const recordQueryParams = ref<{
  currentStatus: string | undefined;
  executedBy: string | undefined;
  executeEndTime: any;
  keyword: string | undefined;
  maintenanceResult: string | undefined;
  maintenanceType: string | undefined;
  recoveryMode: string | undefined;
  startTime: any;
}>({
  executedBy: undefined,
  executeEndTime: null,
  keyword: undefined,
  maintenanceResult: undefined,
  maintenanceType: undefined,
  recoveryMode: undefined,
  startTime: null,
  currentStatus: undefined,
});

// ========== 下拉选项 ==========
const maintenanceResultOptions = [
  { label: $t('maintenanceTask.resultPass'), value: 'PASS' },
  { label: $t('maintenanceTask.resultFail'), value: 'FAIL' },
];

const maintenanceTypeOptions = [
  { label: $t('maintenanceTask.maintenanceTypeRegular'), value: 'REGULAR' },
  {
    label: $t('maintenanceTask.maintenanceTypeConditional'),
    value: 'CONDITIONAL',
  },
  { label: $t('maintenanceTask.maintenanceTypeEmergency'), value: 'EMERGENCY' },
];

const recoveryModeOptions = [
  { label: $t('maintenanceTask.recoveryModePercent'), value: 'PERCENT' },
  { label: $t('maintenanceTask.recoveryModeFixed'), value: 'FIXED' },
  { label: $t('maintenanceTask.recoveryModeManual'), value: 'MANUAL' },
  { label: $t('maintenanceTask.recoveryModeNone'), value: 'NONE' },
];

// ========== 记录列表表格配置 ==========
const recordGridOptions: VxeGridProps<MaintenanceRecord> = {
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
      field: 'maintenanceTypeName',
      title: $t('maintenanceTask.maintenanceType'),
      minWidth: 100,
    },
    {
      field: 'maintenanceResultName',
      title: $t('maintenanceTask.maintenanceResult'),
      minWidth: 100,
      slots: { default: 'result' },
    },
    {
      field: 'recoveryModeName',
      title: $t('maintenanceTask.recoveryMode'),
      minWidth: 100,
    },
    {
      field: 'executedBy',
      title: $t('maintenanceTask.executedBy'),
      minWidth: 100,
    },
    {
      field: 'createdTime',
      title: $t('maintenanceTask.createdTime'),
      minWidth: 160,
    },
    {
      field: 'executeEndTime',
      title: $t('maintenanceTask.executeTime'),
      minWidth: 160,
    },
    {
      field: 'action',
      title: $t('maintenanceTask.action'),
      width: 80,
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
        return await queryRecordData({
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

const recordGridEvents: VxeGridListeners<MaintenanceRecord> = {};

const [RecordGrid, recordGridApi] = useVbenVxeGrid({
  gridEvents: recordGridEvents,
  gridOptions: recordGridOptions,
});

// ========== 数据查询 ==========
function queryRecordData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  return new Promise<{ items: MaintenanceRecord[]; total: number }>(
    (resolve) => {
      const params: MaintenanceRecordPageParams = {
        moldCode: recordQueryParams.value.keyword,
        maintenanceResult: recordQueryParams.value.maintenanceResult as any,
        maintenanceType: recordQueryParams.value.maintenanceType as any,
        recoveryMode: recordQueryParams.value.recoveryMode as any,
        startTime: recordQueryParams.value.startTime?.[0],
        endTime: recordQueryParams.value.startTime?.[1],
        executeStartTime: recordQueryParams.value.executeEndTime?.[0],
        executeEndTime: recordQueryParams.value.executeEndTime?.[1],
        executedBy: recordQueryParams.value.executedBy,
        pageNum,
        pageSize,
      };

      getMaintenanceRecordPage(params)
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
 * 重置记录列表查询参数并刷新表格
 * @returns 无返回值
 * @since 2026-05-21 10:15:00
 */
function handleRecordReset() {
  recordQueryParams.value = {
    executedBy: undefined,
    executeEndTime: null,
    keyword: undefined,
    maintenanceResult: undefined,
    maintenanceType: undefined,
    recoveryMode: undefined,
    startTime: null,
    currentStatus: undefined,
  };
  recordGridApi.reload();
}

// ========== 状态颜色映射 ==========
const resultColorMap: Record<string, string> = {
  通过: 'success',
  不通过: 'error',
};

// ========== 详情抽屉 ==========
const detailVisible = ref(false);
const detailData = ref<MaintenanceRecordDetail | null>(null);

/**
 * 打开记录详情抽屉
 * @param row - 记录行数据，包含记录ID
 * @returns 无返回值，详情数据通过 getMaintenanceRecordDetail 接口获取
 * @throws 获取详情失败时显示错误提示
 * @since 2026-05-21 10:15:00
 */
function handleDetail(row: any) {
  getMaintenanceRecordDetail(row.id)
    .then((res: any) => {
      detailData.value = res;
      detailVisible.value = true;
    })
    .catch(() => {
      message.error($t('common.operationFailure'));
    });
}
</script>

<template>
  <Page>
    <Card class="!mb-4">
      <Form :model="recordQueryParams" layout="inline">
        <!-- 关键词搜索 -->
        <FormItem
          :label="$t('maintenanceTask.keyword')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="recordQueryParams.keyword"
            :placeholder="$t('maintenanceTask.keywordPlaceholder')"
            allow-clear
            style="width: 160px"
          />
        </FormItem>

        <!-- 保养结果 -->
        <FormItem
          :label="$t('maintenanceTask.maintenanceResult')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="recordQueryParams.maintenanceResult"
            :placeholder="$t('maintenanceTask.maintenanceResultPlaceholder')"
            allow-clear
            :options="maintenanceResultOptions"
            style="width: 120px"
          />
        </FormItem>

        <!-- 保养类型 -->
        <FormItem
          :label="$t('maintenanceTask.maintenanceType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="recordQueryParams.maintenanceType"
            :placeholder="$t('maintenanceTask.maintenanceTypePlaceholder')"
            allow-clear
            :options="maintenanceTypeOptions"
            style="width: 140px"
          />
        </FormItem>

        <!-- 恢复模式 -->
        <FormItem
          :label="$t('maintenanceTask.recoveryMode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="recordQueryParams.recoveryMode"
            :placeholder="$t('maintenanceTask.recoveryModePlaceholder')"
            allow-clear
            :options="recoveryModeOptions"
            style="width: 140px"
          />
        </FormItem>

        <br />

        <!-- 生成时间 -->
        <FormItem
          :label="$t('maintenanceTask.createdTime')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="recordQueryParams.startTime"
            :placeholder="[
              $t('maintenanceTask.startDate'),
              $t('maintenanceTask.endDate'),
            ]"
            format="YYYY-MM-DD"
            style="width: 240px"
          />
        </FormItem>

        <!-- 保养时间 -->
        <FormItem
          :label="$t('maintenanceTask.executeTime')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="recordQueryParams.executeEndTime"
            :placeholder="[
              $t('maintenanceTask.startDate'),
              $t('maintenanceTask.endDate'),
            ]"
            format="YYYY-MM-DD"
            style="width: 240px"
          />
        </FormItem>

        <!-- 操作人 -->
        <FormItem
          :label="$t('maintenanceTask.executedBy')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="recordQueryParams.executedBy"
            :placeholder="$t('maintenanceTask.executedByPlaceholder')"
            allow-clear
            style="width: 120px"
          />
        </FormItem>

        <!-- 重置按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleRecordReset">
            {{ $t('maintenanceTask.reset') }}
          </Button>
        </FormItem>

        <!-- 查询按钮 -->
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="recordGridApi.reload()">
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
      <!-- 记录列表 -->
      <RecordGrid>
        <template #toolbar-tools></template>
        <!-- 保养结果插槽 -->
        <template #result="{ row }">
          <Tag :color="resultColorMap[row.maintenanceResultName!] || 'default'">
            {{ row.maintenanceResultName }}
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
      </RecordGrid>
    </Card>

    <!-- 详情抽屉 -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('maintenanceTask.recordDetailTitle')"
      width="650"
      :destroy-on-close="true"
    >
      <div v-if="detailData">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem :label="$t('maintenanceTask.maintenanceNo')">
            {{ detailData.maintenanceNo }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.moldCode')">
            {{ detailData.moldCode }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.moldName')">
            {{ detailData.moldName || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.maintenanceType')">
            {{ detailData.maintenanceType || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.maintenanceResult')">
            {{ detailData.maintenanceResult || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.recoveryMode')">
            {{ detailData.recoveryMode || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.executedBy')">
            {{ detailData.executedBy }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.executeTime')">
            {{ detailData.executeEndTime || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.usageBefore')">
            {{ detailData.usageBefore ?? '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.usageAfter')">
            {{ detailData.usageAfter ?? '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.recoveredCount')">
            {{ detailData.recoveredCount ?? '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('maintenanceTask.maintenanceContent')"
            :span="2"
          >
            {{ detailData.maintenanceContent || '-' }}
          </DescriptionsItem>
        </Descriptions>

        <Divider>{{ $t('maintenanceTask.verifyInfo') }}</Divider>

        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem :label="$t('maintenanceTask.verifiedBy')">
            {{ detailData.verifiedBy || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('maintenanceTask.verifiedTime')">
            {{ detailData.verifiedTime || '-' }}
          </DescriptionsItem>
          <DescriptionsItem
            :label="$t('maintenanceTask.verifyComment')"
            :span="2"
          >
            {{ detailData.verifyComment || '-' }}
          </DescriptionsItem>
        </Descriptions>

        <Divider>{{ $t('maintenanceTask.action') }}</Divider>

        <table class="detail-table">
          <thead>
            <tr>
              <th style="width: 50px">#</th>
              <th>{{ $t('maintenanceTask.itemName') }}</th>
              <th>{{ $t('maintenanceTask.itemDescription') }}</th>
              <th style="width: 80px">
                {{ $t('maintenanceTask.isRequired') }}
              </th>
              <th style="width: 80px">
                {{ $t('maintenanceTask.isCompleted') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in detailData.details" :key="item.sequenceNo">
              <td>{{ item.sequenceNo }}</td>
              <td>{{ item.itemName }}</td>
              <td>{{ item.itemDescription || '-' }}</td>
              <td>
                <Tag :color="item.isRequired ? 'warning' : 'default'">
                  {{ item.isRequired ? '是' : '否' }}
                </Tag>
              </td>
              <td>
                <Tag :color="item.isCompleted ? 'success' : 'error'">
                  {{ item.isCompleted ? '完成' : '未完成' }}
                </Tag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Drawer>
  </Page>
</template>

<style scoped>
.detail-table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.detail-table th,
.detail-table td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #d9d9d9;
}

.detail-table th {
  font-weight: 500;
  background-color: #fafafa;
}
</style>
