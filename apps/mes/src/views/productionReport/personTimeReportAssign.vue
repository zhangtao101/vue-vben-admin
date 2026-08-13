<script lang="ts" setup>
/**
 * 工时分配页面
 * 上方表格为分配对象列表（单选，点击行选择），下方表格为生产指示列表（多选分配）。
 * 功能包括：按分配日期/区分/产线等条件分页查询分配对象、单选分配对象联动加载工单序列、
 * 按报工完成数量占比分配、确认/取消确认/重新推送SAP、修改分配量、导出。
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelConfirmPersonTimeAssign,
  confirmPersonTimeAssign,
  distributePersonTimeAssign,
  exportAssignProductionInstructions,
  exportPersonTimeAssign,
  getAssignProductionInstructions,
  getPersonTimeAssignList,
  getProduceLineGroups,
  getProduceLines,
  getSubProduceLines,
  getWorkGroups,
  retransferPersonTimeAssign,
  updatePersonTimeAssignValue,
} from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

const route = useRoute();

// 权限控制
const author = ref<string[]>([]);

// 查询参数（状态类字段未选择时为空）
const queryParams = ref({
  assignDate: '',
  distCode: '',
  produceLineCode: '',
  subProduceLineCode: '',
  shiftCode: '',
  areaGroup: '',
  status: undefined as number | undefined,
  transferFlag: undefined as number | undefined,
  errorFlag: undefined as number | undefined,
});

// 组织架构 4 级联动下拉选项（工作区 -> 产线 -> 子产线 -> 班组）
const groupOptions = ref<any[]>([]);
const lineOptions = ref<any[]>([]);
const subLineOptions = ref<any[]>([]);
const workGroupOptions = ref<any[]>([]);

/**
 * 将接口返回的选项数组转换为 Select 可用的格式。
 * @param data - 接口返回的选项数组，元素包含 id、code、name。
 * @returns 返回 Select 选项数组，value 为 code、label 为 name。
 * @since 2026-08-13 00:00:00
 */
function toOptions(data: any[]) {
  return (data || []).map((item: any) => ({
    value: item.code,
    label: item.name,
    id: item.id,
  }));
}

/**
 * 加载工作区下拉选项。
 * @since 2026-08-13 00:00:00
 */
function loadGroupOptions() {
  return getProduceLineGroups().then((data: any[]) => {
    groupOptions.value = toOptions(data);
  });
}

/**
 * 工作区变化：同步查询参数，加载产线并清空下级选项。
 * @param value - 工作区编码。
 * @since 2026-08-13 00:00:00
 */
function handleGroupChange(value: any) {
  queryParams.value.areaGroup = value || '';
  queryParams.value.produceLineCode = '';
  queryParams.value.subProduceLineCode = '';
  queryParams.value.shiftCode = '';
  lineOptions.value = [];
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getProduceLines({ produceLineGroupCode: value }).then((data: any[]) => {
      lineOptions.value = toOptions(data);
    });
  }
}

/**
 * 产线变化：同步查询参数，加载子产线并清空下级选项。
 * @param value - 产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleLineChange(value: any) {
  queryParams.value.produceLineCode = value || '';
  queryParams.value.subProduceLineCode = '';
  queryParams.value.shiftCode = '';
  subLineOptions.value = [];
  workGroupOptions.value = [];
  if (value) {
    getSubProduceLines({ produceLineCode: value }).then((data: any[]) => {
      subLineOptions.value = toOptions(data);
    });
  }
}

/**
 * 子产线变化：同步查询参数，加载班组并清空下级选项。
 * @param value - 子产线编码。
 * @since 2026-08-13 00:00:00
 */
function handleSubLineChange(value: any) {
  queryParams.value.subProduceLineCode = value || '';
  queryParams.value.shiftCode = '';
  workGroupOptions.value = [];
  if (value) {
    getWorkGroups({ subProduceLineCode: value }).then((data: any[]) => {
      workGroupOptions.value = toOptions(data);
    });
  }
}

/**
 * 班组变化：同步查询参数。
 * @param value - 班组编码。
 * @since 2026-08-13 00:00:00
 */
function handleShiftChange(value: any) {
  queryParams.value.shiftCode = value || '';
}

// 下拉选项（区分/确认状态/传送状态/错误状态）
const distOptions = [
  { value: 'TP01', label: $t('personTimeReportAssign.tp01') },
  { value: 'TP02', label: $t('personTimeReportAssign.tp02') },
];
const statusOptions = [
  { value: 0, label: $t('personTimeReportAssign.unconfirmed') },
  { value: 1, label: $t('personTimeReportAssign.confirmed') },
];
const transferOptions = [
  { value: 0, label: $t('personTimeReportAssign.pendingTransfer') },
  { value: 1, label: $t('personTimeReportAssign.transferred') },
];
const errorOptions = [
  { value: 0, label: $t('personTimeReportAssign.noError') },
  { value: 1, label: $t('personTimeReportAssign.hasError') },
];

// ========== 上方表格：分配对象列表 ==========

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50 },
    {
      title: $t('personTimeReportAssign.assignNo'),
      field: 'assignNo',
      minWidth: 140,
    },
    {
      title: $t('personTimeReportAssign.assignDate'),
      field: 'assignDate',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.distName'),
      field: 'distName',
      minWidth: 100,
    },
    {
      title: $t('personTimeReportAssign.areaGroup'),
      field: 'areaGroup',
      minWidth: 100,
    },
    {
      title: $t('personTimeReportAssign.produceLineName'),
      field: 'produceLineName',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.subProduceLineName'),
      field: 'subProduceLineName',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.shiftName'),
      field: 'shiftName',
      minWidth: 90,
    },
    {
      title: $t('personTimeReportAssign.assignTargetValue'),
      field: 'assignTargetValue',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.status'),
      field: 'status',
      minWidth: 90,
      slots: { default: 'statusCell' },
    },
    {
      title: $t('personTimeReportAssign.transferFlag'),
      field: 'transferFlag',
      minWidth: 100,
      slots: { default: 'transferCell' },
    },
    {
      title: $t('personTimeReportAssign.errorFlag'),
      field: 'errorFlag',
      minWidth: 90,
      slots: { default: 'errorCell' },
    },
    {
      title: $t('personTimeReportAssign.operation'),
      field: 'operation',
      width: 140,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: ({ page }) => {
        return queryAssignData({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  radioConfig: { highlight: false, labelField: 'name', trigger: 'row' },
  rowConfig: { keyField: 'id' },
  rowClassName: ({ row }) => {
    if (row && row.errorFlag === 1) {
      return 'bg-red-500 text-white';
    }
    return '';
  },
  showOverflow: 'tooltip',
  stripe: false,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

/**
 * 查询分配对象列表数据。
 * @param params - 分页参数。
 * @since 2026-08-13 00:00:00
 */
function queryAssignData({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) {
  // 上方表格重新加载数据时，清空下方生产指示列表
  currentAssignId.value = null;
  currentAssignStatus.value = null;
  detailSelectedRows.value = [];
  editingId.value = null;
  const params = {
    ...queryParams.value,
    pageNum,
    pageSize,
  };
  return getPersonTimeAssignList(params).then((res: any) => ({
    items: res.results || [],
    total: res.total || 0,
  }));
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    radioChange: ({ row }: any) => {
      handleAssignSelect(row);
    },
  },
  gridOptions,
});

// 当前选中的分配对象 ID，选中后联动加载下方生产指示列表
const currentAssignId = ref<null | number>(null);
// 当前选中分配对象的状态，status 为 1（已确认）时下方表格只读
const currentAssignStatus = ref<null | number>(null);

/**
 * 上方表格单选分配对象：记录选中 ID 与状态，联动加载下方生产指示列表。
 * @param row - 被选中的表格行数据。
 * @since 2026-08-13 00:00:00
 */
function handleAssignSelect(row: any) {
  if (!row || row.id == null) return;
  if (currentAssignId.value === row.id) return;
  currentAssignId.value = row.id;
  currentAssignStatus.value = row.status ?? null;
  detailSelectedRows.value = [];
  editingId.value = null;
  detailGridApi.reload();
}

// ========== 下方表格：生产指示列表 ==========

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: { highlight: true, labelField: 'name', trigger: 'row' },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      title: $t('personTimeReportAssign.instructionNo'),
      field: 'instructionNo',
      minWidth: 180,
    },
    {
      title: $t('personTimeReportAssign.productCode'),
      field: 'productCode',
      minWidth: 100,
    },
    {
      title: $t('personTimeReportAssign.productName'),
      field: 'productName',
      minWidth: 140,
    },
    {
      title: $t('personTimeReportAssign.finishQty'),
      field: 'finishQty',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.allocationRatio'),
      field: 'allocationRatio',
      minWidth: 100,
      slots: { default: 'allocationRatioCell' },
    },
    {
      title: $t('personTimeReportAssign.assignedQty'),
      field: 'assignedQty',
      minWidth: 120,
      slots: { default: 'assignedQtyEdit' },
    },
    {
      title: $t('personTimeReportAssign.produceDate'),
      field: 'produceDate',
      minWidth: 110,
    },
    {
      title: $t('personTimeReportAssign.operation'),
      field: 'operation',
      width: 140,
      fixed: 'right',
      slots: { default: 'detailOperation' },
    },
  ],
  height: 300,
  proxyConfig: {
    ajax: {
      query: () => {
        return queryDetailData();
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

/**
 * 查询当前分配对象的生产指示列表数据。
 * @since 2026-08-13 00:00:00
 */
function queryDetailData() {
  if (currentAssignId.value == null) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return getAssignProductionInstructions(currentAssignId.value).then(
    (res: any) => ({
      items: res || [],
      total: (res || []).length,
    }),
  );
}

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: () => {
      updateDetailSelection();
    },
    checkboxAll: () => {
      updateDetailSelection();
    },
  },
  gridOptions: detailGridOptions,
});

// 下方表格勾选的生产指示行
const detailSelectedRows = ref<any[]>([]);
// 当前处于编辑状态的行 ID（仅允许修改 assignedQty 字段）
const editingId = ref<null | number>(null);

/**
 * 更新下方表格选中行数据（勾选/全选变化时调用）。
 * @since 2026-08-13 00:00:00
 */
function updateDetailSelection() {
  detailSelectedRows.value = detailGridApi.grid?.getCheckboxRecords() || [];
}

/**
 * 按当前查询条件重新加载分配对象列表，下方表格由查询方法统一清空。
 * @since 2026-08-13 00:00:00
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 重置查询条件并重新加载分配对象列表。
 * @since 2026-08-13 00:00:00
 */
function handleReset() {
  queryParams.value = {
    assignDate: '',
    distCode: '',
    produceLineCode: '',
    subProduceLineCode: '',
    shiftCode: '',
    areaGroup: '',
    status: undefined,
    transferFlag: undefined,
    errorFlag: undefined,
  };
  gridApi.reload();
}

/**
 * 分配日期变化：同步查询参数。
 * @param _date - 日期对象（未使用）。
 * @param dateString - 格式化后的日期字符串。
 * @since 2026-08-13 00:00:00
 */
function handleDateChange(_date: any, dateString: string) {
  queryParams.value.assignDate = dateString || '';
}

/**
 * 导出分配对象 Excel：接口返回文件下载地址，直接跳转下载。
 * @since 2026-08-13 00:00:00
 */
function handleExport() {
  exportPersonTimeAssign({ ...queryParams.value }).then((res: string) => {
    if (res) {
      window.location.href = res;
    }
  });
}

/**
 * 确认分配：弹窗确认后调用接口并触发 SAP 内容推送。
 * @param row - 待确认的分配对象行数据。
 * @since 2026-08-13 00:00:00
 */
function handleConfirm(row: any) {
  Modal.confirm({
    title: $t('personTimeReportAssign.prompt'),
    content: $t('personTimeReportAssign.confirmTip'),
    onOk: () => {
      confirmPersonTimeAssign(row.id).then(() => {
        message.success($t('personTimeReportAssign.confirmSuccess'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 取消确认：弹窗确认后调用接口并触发 SAP 消息撤回。
 * @param row - 待取消确认的分配对象行数据。
 * @since 2026-08-13 00:00:00
 */
function handleCancelConfirm(row: any) {
  Modal.confirm({
    title: $t('personTimeReportAssign.prompt'),
    content: $t('personTimeReportAssign.cancelConfirmTip'),
    onOk: () => {
      cancelConfirmPersonTimeAssign(row.id).then(() => {
        message.success($t('personTimeReportAssign.cancelConfirmSuccess'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 重新推送 SAP：弹窗确认后调用接口按 SAP 结果更新状态。
 * @param row - 待重新推送的分配对象行数据。
 * @since 2026-08-13 00:00:00
 */
function handleRetransfer(row: any) {
  Modal.confirm({
    title: $t('personTimeReportAssign.prompt'),
    content: $t('personTimeReportAssign.retransferTip'),
    onOk: () => {
      retransferPersonTimeAssign(row.id).then(() => {
        message.success($t('personTimeReportAssign.retransferSuccess'));
        gridApi.reload();
      });
    },
  });
}

/**
 * 导出当前分配对象的工单分配明细 Excel。
 * @since 2026-08-13 00:00:00
 */
function handleDetailExport() {
  if (currentAssignId.value == null) {
    message.warning($t('personTimeReportAssign.selectAssignRowFirst'));
    return;
  }
  exportAssignProductionInstructions(currentAssignId.value).then(
    (res: string) => {
      if (res) {
        window.location.href = res;
      }
    },
  );
}

/**
 * 按报工完成数量占比分配：勾选生产指示后弹窗二次确认，确认后调用接口由后端计算占比与分配量。
 * @since 2026-08-13 00:00:00
 */
function handleDistribute() {
  if (currentAssignId.value == null) {
    message.warning($t('personTimeReportAssign.selectAssignRowFirst'));
    return;
  }
  if (detailSelectedRows.value.length === 0) {
    message.warning($t('personTimeReportAssign.selectInstructions'));
    return;
  }
  Modal.confirm({
    title: $t('personTimeReportAssign.prompt'),
    content: $t('personTimeReportAssign.distributeTip'),
    onOk: () => {
      distributePersonTimeAssign({
        assignId: currentAssignId.value!,
        instructionIds: detailSelectedRows.value.map((row: any) => row.id),
      }).then(() => {
        message.success($t('personTimeReportAssign.distributeSuccess'));
        detailSelectedRows.value = [];
        detailGridApi.reload();
      });
    },
  });
}

/**
 * 进入行内编辑状态（仅允许修改 assignedQty 字段）。
 * @param row - 待编辑的生产指示行数据。
 * @since 2026-08-13 00:00:00
 */
function handleEdit(row: any) {
  editingId.value = row.id;
}

/**
 * 保存修改分配量：需已执行分配（detailId 存在）。
 * @param row - 正在编辑的生产指示行数据。
 * @since 2026-08-13 00:00:00
 */
function handleEditSave(row: any) {
  if (row.detailId == null) {
    message.warning($t('personTimeReportAssign.detailIdRequired'));
    return;
  }
  updatePersonTimeAssignValue({
    assignedValue: Number(row.assignedQty),
    detailId: row.detailId,
  }).then(() => {
    message.success($t('personTimeReportAssign.updateSuccess'));
    editingId.value = null;
    detailGridApi.reload();
  });
}

/**
 * 取消编辑并重新加载数据恢复原值。
 * @since 2026-08-13 00:00:00
 */
function handleEditCancel() {
  editingId.value = null;
  detailGridApi.reload();
}

onMounted(() => {
  // 预加载工作区下拉选项
  loadGroupOptions();
  // 获取当前页面权限
  queryAuth(route.meta.code as string).then((data: string[]) => {
    author.value = data || [];
  });
});
</script>

<template>
  <Page>
    <!-- 查询区 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('personTimeReportAssign.assignDate')"
          style="margin-bottom: 1em"
        >
          <DatePicker
            :placeholder="$t('personTimeReportAssign.inputAssignDate')"
            style="width: 150px"
            allow-clear
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.distCode')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.distCode"
            :options="distOptions"
            :placeholder="$t('personTimeReportAssign.distCode')"
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.areaGroup')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.areaGroup"
            :options="groupOptions"
            :placeholder="$t('personTimeReportAssign.areaGroup')"
            style="width: 150px"
            allow-clear
            @change="handleGroupChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.produceLine')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.produceLineCode"
            :options="lineOptions"
            :placeholder="$t('personTimeReportAssign.produceLine')"
            style="width: 150px"
            allow-clear
            @change="handleLineChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.subProduceLine')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.subProduceLineCode"
            :options="subLineOptions"
            :placeholder="$t('personTimeReportAssign.subProduceLine')"
            style="width: 150px"
            allow-clear
            @change="handleSubLineChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.shift')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.shiftCode"
            :options="workGroupOptions"
            :placeholder="$t('personTimeReportAssign.shift')"
            style="width: 150px"
            allow-clear
            @change="handleShiftChange"
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.status')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.status"
            :options="statusOptions"
            :placeholder="$t('personTimeReportAssign.status')"
            style="width: 130px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.transferFlag')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.transferFlag"
            :options="transferOptions"
            :placeholder="$t('personTimeReportAssign.transferFlag')"
            style="width: 130px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('personTimeReportAssign.errorFlag')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.errorFlag"
            :options="errorOptions"
            :placeholder="$t('personTimeReportAssign.errorFlag')"
            style="width: 130px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleQuery">
            {{ $t('personTimeReportAssign.search') }}
          </Button>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('personTimeReportAssign.reset') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 分配对象列表（单选，点击行选择） -->
    <Card class="!mb-8" :title="$t('personTimeReportAssign.assignList')">
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="handleExport"
            >
              <Icon
                icon="mdi:export-variant"
                class="inline-block align-middle"
              />
              {{ $t('personTimeReportAssign.export') }}
            </Button>
          </Space>
        </template>

        <!-- 状态列 -->
        <template #statusCell="{ row }">
          {{
            row.status === 1
              ? $t('personTimeReportAssign.confirmed')
              : $t('personTimeReportAssign.unconfirmed')
          }}
        </template>
        <template #transferCell="{ row }">
          {{
            row.transferFlag === 1
              ? $t('personTimeReportAssign.transferred')
              : $t('personTimeReportAssign.pendingTransfer')
          }}
        </template>
        <template #errorCell="{ row }">
          {{
            row.errorFlag === 1
              ? $t('personTimeReportAssign.hasError')
              : $t('personTimeReportAssign.noError')
          }}
        </template>

        <!-- 操作列：确认分配 / 取消确认 / 重新发送 -->
        <template #operation="{ row }">
          <Tooltip :title="$t('personTimeReportAssign.confirm')">
            <Button
              v-if="author.includes('确认') && row.transferFlag === 0"
              type="link"
              class="px-1 mr-1"
              @click="handleConfirm(row)"
            >
              <Icon
                icon="mdi:check-circle-outline"
                class="inline-block align-middle text-lg"
              />
            </Button>
          </Tooltip>
          <Tooltip :title="$t('personTimeReportAssign.cancelConfirm')">
            <Button
              v-if="
                author.includes('取消确认') &&
                row.transferFlag === 1 &&
                row.errorFlag === 0
              "
              type="link"
              class="px-1 mr-1"
              @click="handleCancelConfirm(row)"
            >
              <Icon
                icon="mdi:close-circle-outline"
                class="inline-block align-middle text-lg"
              />
            </Button>
          </Tooltip>
          <Tooltip :title="$t('personTimeReportAssign.retransfer')">
            <Button
              v-if="author.includes('重新推送') && row.errorFlag === 1"
              type="link"
              class="px-1 mr-1"
              @click="handleRetransfer(row)"
            >
              <Icon
                icon="mdi:send-outline"
                class="inline-block align-middle text-lg"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>

    <!-- 生产指示列表（选择分配对象后显示） -->
    <Card
      v-if="currentAssignId != null"
      :title="$t('personTimeReportAssign.instructionList')"
    >
      <DetailGrid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="author.includes('分配')"
              type="primary"
              :disabled="
                detailSelectedRows.length === 0 || currentAssignStatus === 1
              "
              @click="handleDistribute"
            >
              <Icon icon="mdi:chart-pie" class="inline-block align-middle" />
              {{ $t('personTimeReportAssign.assign') }}
            </Button>
            <Button
              v-if="author.includes('导出')"
              type="primary"
              @click="handleDetailExport"
            >
              <Icon
                icon="mdi:export-variant"
                class="inline-block align-middle"
              />
              {{ $t('personTimeReportAssign.export') }}
            </Button>
          </Space>
        </template>

        <!-- 分配占比列：0.25 显示为 25% -->
        <template #allocationRatioCell="{ row }">
          {{
            row.allocationRatio != null
              ? `${Number(row.allocationRatio) * 100}%`
              : ''
          }}
        </template>

        <!-- 分配量列：编辑状态下可修改 -->
        <template #assignedQtyEdit="{ row }">
          <InputNumber
            v-if="editingId === row.id"
            v-model:value="row.assignedQty"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
          <span v-else>{{ row.assignedQty }}</span>
        </template>

        <!-- 操作列：编辑 / 保存 / 取消 -->
        <template #detailOperation="{ row }">
          <template v-if="author.includes('分配')">
            <template v-if="editingId === row.id">
              <Tooltip :title="$t('personTimeReportAssign.save')">
                <Button type="link" class="px-1" @click="handleEditSave(row)">
                  <Icon
                    icon="mdi:content-save-outline"
                    class="inline-block align-middle text-lg"
                  />
                </Button>
              </Tooltip>
              <Tooltip :title="$t('personTimeReportAssign.cancel')">
                <Button type="link" class="px-1" @click="handleEditCancel">
                  <Icon
                    icon="mdi:close"
                    class="inline-block align-middle text-lg"
                  />
                </Button>
              </Tooltip>
            </template>
            <Tooltip v-else :title="$t('personTimeReportAssign.edit')">
              <Button
                type="link"
                class="px-1"
                :disabled="currentAssignStatus === 1"
                @click="handleEdit(row)"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  class="inline-block align-middle text-lg"
                />
              </Button>
            </Tooltip>
          </template>
        </template>
      </DetailGrid>
    </Card>
  </Page>
</template>
