<script lang="ts" setup>
/**
 * [INPUT]: 依赖 #/api (smtWorksheetSearch/smtWorksheetUpdate/smtAllLineList)、
 *         #/locales ($t)
 * [OUTPUT]: 对外提供 SMTPlantAdd 页面组件，提供 SMT 工单查询与状态流转管理
 * [POS]: 属于生产报工(productionReport)模块的 SMT 工单状态管理主页面，通过路由 /productionReport/SMTPlantAdd 访问
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-07-17 10:00:00
 */
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

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
  RangePicker,
  Select,
  Space,
  Table,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  smtAllLineList,
  smtWorksheetReportDetail,
  smtWorksheetSearch,
  smtWorksheetUpdateStatus,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';
import WorkSheetReportDrawer from '#/util/component/SMTPlantAdd/WorkSheetReportDrawer.vue';

// region 状态枚举
const STATUS = {
  NOT_STARTED: 1, // 未开始
  IN_PROGRESS: 2, // 开始 / 正在进行中
  COMPLETED: 3, // 完成
  PAUSED: 4, // 暂停
};
// endregion

// region 权限
const route = useRoute();
const author = ref<string[]>([]);
// endregion

// region 线别下拉
const lineOptions = ref<any[]>([]);

function loadLineOptions() {
  smtAllLineList(1).then((res: any) => {
    lineOptions.value = (Array.isArray(res) ? res : []).map((item: any) => ({
      value: item.id,
      label: item.lineName,
    }));
  });
}
// endregion

// region 查询参数
const queryParams = ref<any>({
  workSheetCode: '',
  plannedTime: [],
  planCode: '',
  productCode: '',
  productName: '',
  lineId: undefined,
});

const isAsc = ref<boolean>(false);
// endregion

// region 表格配置
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50, minWidth: 50 },
    {
      field: 'workSheetCode',
      title: $t('SMTmanagement.workOrderNumber'),
      minWidth: 150,
    },
    {
      field: 'planDateStart',
      title: $t('SMTmanagement.plannedTime'),
      minWidth: 130,
    },
    {
      field: 'planDateStop',
      title: $t('SMTmanagement.planDateStop'),
      minWidth: 130,
    },
    { field: 'planCode', title: $t('SMTmanagement.planNumber'), minWidth: 150 },
    {
      field: 'productName',
      title: $t('SMTmanagement.productName'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'productCode',
      title: $t('SMTmanagement.productNumber'),
      minWidth: 100,
    },
    {
      field: 'status',
      title: $t('SMTPlantAdd.status'),
      minWidth: 100,
      slots: { default: 'statusSlot' },
    },
    { field: 'remark', title: $t('SMTmanagement.remark'), minWidth: 100 },
    {
      field: 'action',
      title: $t('common.action'),
      fixed: 'right',
      minWidth: 600,
      slots: { default: 'action' },
    },
  ],
  height: 500,
  stripe: true,
  sortConfig: { multiple: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  sortChange: ({ sortList }: any) => {
    if (sortList && sortList.length > 0) {
      isAsc.value = sortList[0].order === 'asc';
      gridApi.reload();
    }
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });
// endregion

// region 查询数据
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = {
      ...queryParams.value,
      processType: 1,
      isAsc: isAsc.value ? 1 : 2,
    };
    // 处理日期范围
    if (params.plannedTime && params.plannedTime.length === 2) {
      params.planDateStart = dayjs(params.plannedTime[0]).format('YYYY-MM-DD');
      params.planDateEnd = dayjs(params.plannedTime[1]).format('YYYY-MM-DD');
    }
    delete params.plannedTime;

    smtWorksheetSearch({
      ...params,
      pageNum: page,
      pageSize,
    })
      .then((res: any) => {
        resolve({
          total: res?.total ?? 0,
          items: res?.results ?? res?.list ?? [],
        });
      })
      .catch((error: any) => reject(error));
  });
}
// endregion

// region 状态展示
function getStatusLabel(status: any) {
  switch (status) {
    case STATUS.COMPLETED: {
      return $t('SMTPlantAdd.statusCompleted');
    }
    case STATUS.IN_PROGRESS: {
      return $t('SMTPlantAdd.statusInProgress');
    }
    case STATUS.NOT_STARTED: {
      return $t('SMTPlantAdd.statusNotStarted');
    }
    case STATUS.PAUSED: {
      return $t('SMTPlantAdd.statusPaused');
    }
    default: {
      return '';
    }
  }
}
// endregion

// region 按钮显示与权限
// 状态变更权限：开始、结束、暂停、恢复
function canStart(status: any) {
  return status === STATUS.NOT_STARTED && author.value.includes('状态变更');
}
function canEnd(status: any) {
  return status === STATUS.IN_PROGRESS && author.value.includes('状态变更');
}
function canPause(status: any) {
  return status === STATUS.IN_PROGRESS && author.value.includes('状态变更');
}
function canResume(status: any) {
  return status === STATUS.PAUSED && author.value.includes('状态变更');
}
// 撤回权限
function canWithdraw(status: any) {
  return status === STATUS.COMPLETED && author.value.includes('撤回');
}
// 工单报工 / 工单冲红：仅“开始”状态，且具备对应权限才显示
function canReport(status: any) {
  return status === STATUS.IN_PROGRESS && author.value.includes('工单报工');
}
function canRedFlush(status: any) {
  return status === STATUS.IN_PROGRESS && author.value.includes('工单冲红');
}
// endregion

// region 状态变更
function handleStatusChange(row: any, newStatus: number) {
  Modal.confirm({
    title: $t('SMTPlantAdd.statusChangeConfirmTitle'),
    content: $t('SMTPlantAdd.statusChangeConfirmContent', {
      code: row.workSheetCode,
    }),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () =>
      new Promise<void>((resolve, reject) => {
        smtWorksheetUpdateStatus({ id: row.id, status: newStatus })
          .then(() => {
            message.success($t('common.successfulOperation'));
            gridApi.reload();
            resolve();
          })
          .catch((error: any) => {
            message.error(error?.message || $t('SMTPlantAdd.statusUpdateFailed'));
            reject(error);
          });
      }),
  });
}

// 撤回：开始(2)->未开始(1)，完成(3)->开始(2)
function handleWithdraw(row: any) {
  if (row.status === STATUS.IN_PROGRESS) {
    handleStatusChange(row, STATUS.NOT_STARTED);
  } else if (row.status === STATUS.COMPLETED) {
    handleStatusChange(row, STATUS.IN_PROGRESS);
  }
}
// endregion

// region 工单报工 / 工单冲红
const reportDrawerRef = ref();
function handleReport(row: any) {
  reportDrawerRef.value.open('report', row);
}
function handleRedFlush(row: any) {
  reportDrawerRef.value.open('redFlush', row);
}
// endregion

// region 查看详情（Descriptions 只读展示 + 报工/冲红记录列表）
const detailVisible = ref(false);
const detailRow = ref<any>({});
const reportRecords = ref<any[]>([]);
const reportLoading = ref(false);

function loadReportRecords(id: any) {
  reportLoading.value = true;
  smtWorksheetReportDetail(id)
    .then((res: any) => {
      const list = res?.results ?? res?.list ?? res ?? [];
      reportRecords.value = Array.isArray(list) ? list : [];
    })
    .catch(() => {
      reportRecords.value = [];
    })
    .finally(() => {
      reportLoading.value = false;
    });
}

function handleViewDetail(row: any) {
  detailRow.value = row;
  detailVisible.value = true;
  loadReportRecords(row.id);
}

function handleDetailClose() {
  detailVisible.value = false;
  detailRow.value = {};
  reportRecords.value = [];
}

function getReportTypeLabel(flag: any) {
  return flag === 2
    ? $t('SMTPlantAdd.reportTypeRedFlush')
    : $t('SMTPlantAdd.reportTypeReport');
}

const reportColumns = [
  { title: $t('SMTPlantAdd.reportType'), dataIndex: 'reportFlag', key: 'reportFlag', width: 90 },
  { title: $t('SMTPlantAdd.qualityNumber'), dataIndex: 'qualityNumber', key: 'qualityNumber', width: 90 },
  { title: $t('SMTPlantAdd.unqualityNumber'), dataIndex: 'unqualityNumber', key: 'unqualityNumber', width: 90 },
  { title: $t('SMTPlantAdd.personTime'), dataIndex: 'personTime', key: 'personTime', width: 90 },
  { title: $t('SMTPlantAdd.equipTime'), dataIndex: 'equipTime', key: 'equipTime', width: 90 },
  { title: $t('SMTmanagement.updateTime'), dataIndex: 'createTime', key: 'createTime', minWidth: 150 },
];
// endregion

// region 初始化
onMounted(() => {
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
  loadLineOptions();
});
// endregion
</script>

<template>
  <Page>
    <!-- 搜索区域 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem :label="$t('SMTmanagement.workOrderNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.workSheetCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.plannedTime')" style="margin-bottom: 1em">
          <RangePicker v-model:value="queryParams.plannedTime" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.planNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.planCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.productNumber')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.productName')" style="margin-bottom: 1em">
          <Input v-model:value="queryParams.productName" />
        </FormItem>
        <FormItem :label="$t('SMTmanagement.taskLine')" style="margin-bottom: 1em">
          <Select
            v-model:value="queryParams.lineId"
            :options="lineOptions"
            :placeholder="$t('baseInfo.selectPlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 表格区域 -->
    <Card>
      <Grid>
        <template #toolbar-actions></template>
        <!-- 状态 -->
        <template #statusSlot="{ row }">
          <span>{{ getStatusLabel(row.status) }}</span>
        </template>

        <!-- 操作列 -->
        <template #action="{ row }">
          <Space>
            <Tooltip v-if="canStart(row.status)">
              <template #title>{{ $t('SMTPlantAdd.start') }}</template>
              <Button
                type="link"
                @click="handleStatusChange(row, STATUS.IN_PROGRESS)"
              >
                <Icon icon="mdi:play-circle-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canEnd(row.status)">
              <template #title>{{ $t('SMTPlantAdd.end') }}</template>
              <Button
                type="link"
                @click="handleStatusChange(row, STATUS.COMPLETED)"
              >
                <Icon icon="mdi:stop-circle-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canPause(row.status)">
              <template #title>{{ $t('SMTPlantAdd.pause') }}</template>
              <Button
                type="link"
                @click="handleStatusChange(row, STATUS.PAUSED)"
              >
                <Icon icon="mdi:pause-circle-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canResume(row.status)">
              <template #title>{{ $t('SMTPlantAdd.resume') }}</template>
              <Button
                type="link"
                @click="handleStatusChange(row, STATUS.IN_PROGRESS)"
              >
                <Icon icon="mdi:restore" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canWithdraw(row.status)">
              <template #title>{{ $t('SMTPlantAdd.withdraw') }}</template>
              <Button
                type="link"
                @click="handleWithdraw(row)"
              >
                <Icon icon="mdi:undo" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canReport(row.status)">
              <template #title>{{ $t('SMTPlantAdd.workOrderReport') }}</template>
              <Button
                type="link"
                @click="handleReport(row)"
              >
                <Icon icon="mdi:file-document-edit-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip v-if="canRedFlush(row.status)">
              <template #title>{{ $t('SMTPlantAdd.workOrderRedFlush') }}</template>
              <Button
                type="link"
                @click="handleRedFlush(row)"
              >
                <Icon icon="mdi:file-cancel-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
            <Tooltip>
              <template #title>{{ $t('SMTPlantAdd.viewDetail') }}</template>
              <Button type="link" @click="handleViewDetail(row)">
                <Icon icon="mdi:eye-outline" class="inline-block align-middle text-2xl" />
              </Button>
            </Tooltip>
          </Space>
        </template>
      </Grid>
    </Card>

    <!-- 工单详情抽屉（Descriptions 只读查看） -->
    <Drawer
      v-model:open="detailVisible"
      :title="$t('SMTPlantAdd.viewDetail')"
      width="600"
      :destroy-on-close="true"
      @close="handleDetailClose"
    >
      <Descriptions bordered :column="1" size="small">
        <DescriptionsItem :label="$t('SMTmanagement.workOrderNumber')">
          {{ detailRow.workSheetCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.plannedTime')">
          {{ detailRow.planDateStart }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.planDateStop')">
          {{ detailRow.planDateStop }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.planNumber')">
          {{ detailRow.planCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.productName')">
          {{ detailRow.productName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.productNumber')">
          {{ detailRow.productCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTPlantAdd.status')">
          {{ getStatusLabel(detailRow.status) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('SMTmanagement.remark')">
          {{ detailRow.remark }}
        </DescriptionsItem>
      </Descriptions>

      <div class="!mt-6 font-bold">{{ $t('SMTPlantAdd.reportRecords') }}</div>
      <Table
        class="!mt-2"
        :columns="reportColumns"
        :data-source="reportRecords"
        :loading="reportLoading"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'reportFlag'">
            {{ getReportTypeLabel(record.reportFlag) }}
          </template>
        </template>
      </Table>
    </Drawer>

    <!-- 工单报工 / 工单冲红抽屉 -->
    <WorkSheetReportDrawer ref="reportDrawerRef" @refresh="() => gridApi.reload()" />
  </Page>
</template>
