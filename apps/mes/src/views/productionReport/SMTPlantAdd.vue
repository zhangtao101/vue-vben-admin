<script lang="ts" setup>
/**
 * SMT车间报工页面
 * 用于管理SMT车间的报工记录
 * 功能包括：查询本日计划与完成情况、查看报工明细、新增报工记录
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { $t } from '#/locales';

/* eslint-disable perfectionist/sort-imports */

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Select,
  SelectOption,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import {
  createArticle,
  exportDetail,
  exportList,
  fetchDetailByName,
  fetchLineById,
  fetchList,
  fetchProcessByWorkshop,
  fetchWorkorder,
  fetParams,
} from '#/api';

// region 主表格配置

/**
 * 主表格配置选项
 * 显示本日计划与完成情况一览
 */
const mainColumns: any[] = [
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  { field: 'lineName', title: $t('SMTPlantAdd.taskLine'), minWidth: 100 },
  { field: 'processName', title: $t('SMTPlantAdd.reportProcess'), minWidth: 80 },
  { field: 'subProductCode', title: $t('SMTPlantAdd.partCode'), minWidth: 80 },
  {
    field: 'subProductName',
    slots: { default: 'subProductName' },
    title: $t('SMTPlantAdd.partName'),
    minWidth: 200,
  },
  {
    field: 'productPlan',
    slots: { default: 'productPlan' },
    title: $t('SMTPlantAdd.partOrProduct'),
    minWidth: 80,
  },
  { field: 'subPlanCode', title: $t('SMTPlantAdd.partPlanCode'), minWidth: 100 },
  { field: 'dayPlanNumber', title: $t('SMTPlantAdd.dayPlanNumber'), minWidth: 100 },
  { field: 'dayFinishNumber', title: $t('SMTPlantAdd.dayFinishNumber'), minWidth: 100 },
  { field: 'updateTime', title: $t('SMTPlantAdd.operationTime'), minWidth: 135 },
  { field: 'updateUser', title: $t('SMTPlantAdd.operator'), minWidth: 80 },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: mainColumns,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await fetchList({
          ...listQuery,
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion 主表格配置

// region 详情表格配置

/**
 * 读码报工明细表格配置
 */
const readCodeColumns: any[] = [
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  { field: 'taskLine', title: $t('SMTPlantAdd.taskLine'), minWidth: 100 },
  { field: 'processName', title: $t('SMTPlantAdd.reportProcess'), minWidth: 80 },
  { field: 'workSheetCode', title: $t('SMTPlantAdd.workOrderCode'), minWidth: 120 },
  { field: 'partCode', title: $t('SMTPlantAdd.partCode'), minWidth: 80 },
  { field: 'partName', title: $t('SMTPlantAdd.partName'), minWidth: 150 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: $t('SMTPlantAdd.partOrProduct'),
    minWidth: 80,
  },
  { field: 'planDateStart', title: $t('SMTPlantAdd.issueDate'), minWidth: 90 },
  { field: 'workSheetPlanNumber', title: $t('SMTPlantAdd.workOrderPlanNumber'), minWidth: 100 },
  { field: 'workSheetFinishNumber', title: $t('SMTPlantAdd.workOrderFinishNumber'), minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: $t('SMTPlantAdd.delay'),
    minWidth: 60,
  },
  { field: 'reportDate', title: $t('SMTPlantAdd.reportDate'), minWidth: 90 },
  { field: 'reportTimeQuantum', title: $t('SMTPlantAdd.reportTimeSlot'), minWidth: 90 },
  { field: 'qcCode', title: $t('SMTPlantAdd.qrCode'), minWidth: 80 },
  { field: 'reportNumber', title: $t('SMTPlantAdd.reportNumber'), minWidth: 80 },
  { field: 'partPlanCode', title: $t('SMTPlantAdd.partPlanCode'), minWidth: 100 },
  { field: 'partPlanNumber', title: $t('SMTPlantAdd.plannedCompletionNumber'), minWidth: 100 },
  { field: 'partPlanFinishNumber', title: $t('SMTPlantAdd.plannedCompletedNumber'), minWidth: 120 },
  { field: 'productName', title: $t('SMTPlantAdd.productName'), minWidth: 150 },
  { field: 'productPlanCode', title: $t('SMTPlantAdd.productPlanCode'), minWidth: 120 },
  { field: 'createTime', title: $t('SMTPlantAdd.operationTime'), minWidth: 135 },
  { field: 'createUserName', title: $t('SMTPlantAdd.operator'), minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: $t('SMTPlantAdd.dataSource'),
    minWidth: 80,
  },
];

/**
 * 人工报工明细表格配置
 */
const manualReportColumns: any[] = [
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  { field: 'taskLine', title: $t('SMTPlantAdd.taskLine'), minWidth: 100 },
  { field: 'processName', title: $t('SMTPlantAdd.reportProcess'), minWidth: 80 },
  { field: 'workSheetCode', title: $t('SMTPlantAdd.workOrderCode'), minWidth: 120 },
  { field: 'partCode', title: $t('SMTPlantAdd.partCode'), minWidth: 80 },
  { field: 'partName', title: $t('SMTPlantAdd.partName'), minWidth: 150 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: $t('SMTPlantAdd.partOrProduct'),
    minWidth: 80,
  },
  { field: 'planDateStart', title: $t('SMTPlantAdd.issueDate'), minWidth: 90 },
  { field: 'workSheetPlanNumber', title: $t('SMTPlantAdd.workOrderPlanNumber'), minWidth: 100 },
  { field: 'workSheetFinishNumber', title: $t('SMTPlantAdd.workOrderFinishNumber'), minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: $t('SMTPlantAdd.delay'),
    minWidth: 60,
  },
  { field: 'reportDate', title: $t('SMTPlantAdd.reportDate'), minWidth: 90 },
  { field: 'reportTimeQuantum', title: $t('SMTPlantAdd.reportTimeSlot'), minWidth: 90 },
  { field: 'qcCode', title: $t('SMTPlantAdd.qrCode'), minWidth: 80 },
  { field: 'reportNumber', title: $t('SMTPlantAdd.reportNumber'), minWidth: 80 },
  { field: 'partPlanCode', title: $t('SMTPlantAdd.partPlanCode'), minWidth: 90 },
  { field: 'partPlanNumber', title: $t('SMTPlantAdd.plannedCompletionNumber'), minWidth: 90 },
  { field: 'partPlanFinishNumber', title: $t('SMTPlantAdd.plannedCompletedNumber'), minWidth: 100 },
  { field: 'productName', title: $t('SMTPlantAdd.productName'), minWidth: 150 },
  { field: 'productPlanCode', title: $t('SMTPlantAdd.productPlanCode'), minWidth: 120 },
  { field: 'createTime', title: $t('SMTPlantAdd.operationTime'), minWidth: 135 },
  { field: 'createUserName', title: $t('SMTPlantAdd.operator'), minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: $t('SMTPlantAdd.dataSource'),
    minWidth: 80,
  },
];

// 初始化时使用默认值
const detailColumns = ref(readCodeColumns);

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: detailColumns.value,
  data: [],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [20, 30, 50],
  },
  stripe: true,
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

// endregion 详情表格配置

// region 弹窗工单表格配置

/**
 * 工单表格配置
 */
const workorderColumns: any[] = [
  { type: 'checkbox', width: 55 },
  { field: 'workSheetCode', title: $t('SMTPlantAdd.workOrderCode'), minWidth: 150 },
  { field: 'sideNo', title: $t('SMTPlantAdd.sideNo'), minWidth: 150 },
  {
    field: 'subProductName',
    title: $t('SMTPlantAdd.partName'),
    minWidth: 150,
  },
  { field: 'subPlanCode', title: $t('SMTPlantAdd.partPlanCode'), minWidth: 150 },
  {
    field: 'isProductPlan',
    slots: { default: 'isProductPlan' },
    title: $t('SMTPlantAdd.partOrProduct'),
    minWidth: 80,
  },
  { field: 'planDateStart', title: $t('SMTPlantAdd.workOrderDate'), minWidth: 150 },
];

const workorderGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: workorderColumns,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  data: [],
  height: 300,
  rowConfig: {
    isCurrent: true,
  },
  rowStyle: setRowStyle,
  stripe: true,
};

const [WorkorderGrid, workorderGridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: handleWorkorderSelect,
  },
  gridOptions: workorderGridOptions,
});

// endregion 弹窗工单表格配置

// region 状态定义

const activeTab = ref<string>('first');
const tableShow = ref(false);
const detailShow = ref(false);
const addShow = ref(false);
const exportShow = ref(false);

// 计算是否可以查询或导出（需要选择报工工序和任务线别）
const canSearchOrExport = computed(() => {
  return !!(listQuery.processCode && listQuery.taskLineCode);
});

// 报工时段选项
const bgTime = [
  '08:00~09:00',
  '09:00~10:00',
  '10:00~11:00',
  '11:00~12:00',
  '12:00~13:00',
  '13:00~14:00',
  '14:00~15:00',
  '15:00~16:00',
  '16:00~17:00',
  '17:00~18:00',
  '18:00~19:00',
  '19:00~20:00',
  '20:00~21:00',
  '21:00~22:00',
  '22:00~23:00',
  '23:00~24:00',
  '00:00~01:00',
  '01:00~02:00',
  '02:00~03:00',
  '03:00~04:00',
  '04:00~05:00',
  '05:00~06:00',
  '06:00~07:00',
  '07:00~08:00',
];

// 部件/产品选项
const productList = [
  { label: $t('SMTPlantAdd.part'), value: 1 },
  { label: $t('SMTPlantAdd.product'), value: 2 },
];

// 查询表单
const listQuery = reactive({
  produceWorkshop: 1,
  processCode: undefined as string | undefined,
  reportDate: dayjs(new Date()).format('YYYY-MM-DD'),
  taskLineCode: undefined as number | string | undefined,
  partName: undefined as string | undefined,
  partOrProduct: undefined as number | undefined,
});

// 详情查询表单
const detailQuery = reactive({
  produceWorkshop: 1,
  reportDate: undefined as string | undefined,
  processCode: undefined as string | undefined,
  taskLineCode: undefined as number | string | undefined,
  partName: undefined as string | undefined,
  partOrProduct: undefined as number | undefined,
  pageNum: 1,
  pageSize: 20,
});

// 弹窗表单
const dialogFormVisible = ref(false);
const popData = reactive<any>({
  reportDate: undefined,
  workSheetCode: undefined,
  workSheetPlanNumber: '',
  workSheetFinishNumber: '',
  subPlanNumber: '',
  produceNotFinishNumber: '',
  subPlanFinishNumber: '',
  number: undefined,
  reportTimeQuantum: undefined,
  processName: undefined,
  lineName: undefined,
});

// 工单查询
const workSheetCode1 = ref<string | undefined>(undefined);
const partPlanCode1 = ref<string | undefined>(undefined);
const selectedWorkorder = ref<any>(null);

// 工序列表和产线列表
const planProcess = ref<any[]>([]);
const taskLineList = ref<any[]>([]);
let processId = '';

// 表单验证规则
const rules: any = {
  reportDate: [{ required: true, message: $t('page.common.requiredField'), trigger: 'change' }],
  processCode: [{ required: true, message: $t('page.common.requiredField'), trigger: 'change' }],
  taskLineCode: [
    { required: true, message: $t('page.common.requiredField'), trigger: 'change' },
  ],
};

const dialogRules: any = {
  workSheetCode: [{ required: true, message: $t('SMTPlantAdd.pleaseSelectWorkOrder'), trigger: 'change' }],
  reportTimeQuantum: [
    { required: true, message: $t('page.common.requiredField'), trigger: 'change' },
  ],
  number: [{ required: true, message: $t('page.common.requiredField'), trigger: 'change' }],
};

// endregion 状态定义

// region 方法定义

/**
 * 查询工序列表
 */
function getProcessList() {
  const workshop = 1;
  fetchProcessByWorkshop(workshop)
    .then((data: any) => {
      planProcess.value = data;
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.getProcessListFailed'));
    });
}

/**
 * 工序变更
 */
function handleProcessChange() {
  processId = '';
  taskLineList.value = [];
  planProcess.value.forEach((item) => {
    if (item.processCode === listQuery.processCode) {
      processId = item.id;
      popData.processName = item.processName;
    }
  });
  if (processId) {
    fetchLineById(processId)
      .then((data: any) => {
        taskLineList.value = data;
      })
      .catch((error: any) => {
        message.error(error.message || $t('SMTPlantAdd.getLineListFailed'));
      });
  }
}

/**
 * 任务线别变更
 */
function handleTaskLineChange() {
  taskLineList.value.forEach((item) => {
    if (item.id === listQuery.taskLineCode) {
      popData.lineName = item.lineName;
    }
  });
}

/**
 * 查询
 */
function handleSearch() {
  gridApi.reload();
  tableShow.value = true;
  detailShow.value = false;
}

/**
 * 导出主表格
 */
function handleExport() {
  exportList(listQuery)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.exportFailed'));
    });
}

/**
 * 查看报工明细
 */
function handleDetail(row: any) {
  detailQuery.reportDate = listQuery.reportDate;
  detailQuery.processCode = listQuery.processCode;
  detailQuery.taskLineCode = listQuery.taskLineCode;
  if (row.productPlan === true) {
    detailQuery.partOrProduct = 2;
  } else if (row.productPlan === false) {
    detailQuery.partOrProduct = 1;
  }
  detailQuery.partName = row.subProductName;
  detailShow.value = true;
  detailColumns.value = readCodeColumns;
  loadReadCodeData();
}

/**
 * Tab 切换
 */
function handleTabChange(key: number | string) {
  activeTab.value = String(key);
  detailColumns.value = key === 'first' ? readCodeColumns : manualReportColumns;
  if (key === 'first') {
    loadReadCodeData();
  } else {
    loadManualData();
  }
}

/**
 * 加载读码报工数据
 */
function loadReadCodeData() {
  const params = {
    ...detailQuery,
    pageNum: 1,
    pageSize: 20,
  };
  fetParams(params)
    .then((data: any) => {
      detailGridApi.grid.reloadData(data.results);
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.loadReadCodeDataFailed'));
    });
}

/**
 * 加载人工报工数据
 */
function loadManualData() {
  const params = {
    ...detailQuery,
    pageNum: 1,
    pageSize: 20,
  };
  fetchDetailByName(params)
    .then((data: any) => {
      detailGridApi.grid.reloadData(data.list);
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.loadManualDataFailed'));
    });
}

/**
 * 导出报工明细
 */
function handleExportDetail() {
  exportDetail(detailQuery)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.exportFailed'));
    });
}

/**
 * 新增报工记录
 */
function handleCreate() {
  // 重置表单
  popData.reportDate = listQuery.reportDate;
  popData.workSheetCode = undefined;
  popData.workSheetPlanNumber = '';
  popData.workSheetFinishNumber = '';
  popData.subPlanNumber = '';
  popData.produceNotFinishNumber = '';
  popData.subPlanFinishNumber = '';
  popData.number = undefined;
  popData.reportTimeQuantum = undefined;

  workSheetCode1.value = undefined;
  partPlanCode1.value = undefined;
  selectedWorkorder.value = null;

  loadWorkorderList();
  dialogFormVisible.value = true;
}

/**
 * 加载工单列表
 */
function loadWorkorderList() {
  const params = {
    taskLineCode: listQuery.taskLineCode,
    reportDate: popData.reportDate,
    workSheetCode: workSheetCode1.value,
    partPlanCode: partPlanCode1.value,
  };
  fetchWorkorder(params)
    .then((data: any) => {
      workorderGridApi.grid.reloadData(data);
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.getWorkorderListFailed'));
    });
}

/**
 * 查询工单
 */
function handleSearchWorkorder() {
  loadWorkorderList();
}

/**
 * 工单选择
 */
function handleWorkorderSelect({ checked, row }: any) {
  if (checked) {
    // 清除其他选择，只保留当前选择
    workorderGridApi.grid.clearCheckboxRow();
    workorderGridApi.grid.setCheckboxRow(row, true);
    selectedWorkorder.value = row;
    popData.workSheetCode = row.workSheetCode;
    popData.workSheetPlanNumber = row.workSheetPlanNumber;
    popData.workSheetFinishNumber = row.workSheetFinishNumber;
    popData.subPlanNumber = row.subPlanNumber;
    popData.produceNotFinishNumber = row.produceNotFinishNumber;
    popData.subPlanFinishNumber =
      row.subPlanNumber - row.produceNotFinishNumber;
  } else {
    selectedWorkorder.value = null;
  }
}

/**
 * 设置行样式
 */
function setRowStyle({ row }: any) {
  const numbers = row.delayFinishNumber + row.workSheetFinishNumber;
  const numbers1 = row.workSheetPlanNumber;

  if (numbers > 0 && numbers < numbers1) {
    return {
      color: 'green',
    };
  } else if (numbers >= numbers1) {
    return {
      color: 'red',
    };
  }
  return {};
}

/**
 * 提交新增数据
 */
function handleSubmit() {
  if (!selectedWorkorder.value) {
    message.warning($t('SMTPlantAdd.pleaseSelectWorkOrder'));
    return;
  }
  const tempData = {
    number: popData.number,
    reportTimeQuantum: popData.reportTimeQuantum,
    workSheetCode: popData.workSheetCode,
  };
  createArticle(tempData)
    .then(() => {
      message.success($t('SMTPlantAdd.saveSuccess'));
      dialogFormVisible.value = false;
      handleSearch();
    })
    .catch((error: any) => {
      message.error(error.message || $t('SMTPlantAdd.saveFailed'));
    });
}

/**
 * 获取按钮权限
 */
function getButton() {
  // TODO: 从后端获取按钮权限
  addShow.value = true;
  exportShow.value = true;
}

// endregion 方法定义

// region 生命周期

onMounted(() => {
  getButton();
  getProcessList();
});

// endregion 生命周期
</script>

<template>
  <Page content-class="SMTPlantAdd">
    <!-- 查询表单 -->
    <Card>
      <Form :model="listQuery" :rules="rules" layout="inline">
        <FormItem :label="$t('SMTPlantAdd.reportDate')" name="reportDate" class="!my-2">
          <DatePicker
            v-model:value="listQuery.reportDate"
            disabled
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.reportProcess')" name="processCode" class="!my-2">
          <Select
            v-model:value="listQuery.processCode"
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
            class="!w-48"
            @change="handleProcessChange"
          >
            <SelectOption
              v-for="item in planProcess"
              :key="item.processCode"
              :value="item.processCode"
            >
              {{ item.processName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.taskLine')" name="taskLineCode" class="!my-2">
          <Select
            v-model:value="listQuery.taskLineCode"
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
            class="!w-48"
            @change="handleTaskLineChange"
          >
            <SelectOption
              v-for="item in taskLineList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.lineName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.partName')" class="!my-2">
          <Input
            v-model:value="listQuery.partName"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseInput')"
            class="!w-48"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.partOrProduct')" class="!my-2">
          <Select
            v-model:value="listQuery.partOrProduct"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
            class="!w-48"
          >
            <SelectOption
              v-for="item in productList"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Space>
            <Button
              type="primary"
              :disabled="!canSearchOrExport"
              @click="handleSearch"
            >
              <Icon icon="mdi:search" class="mr-1" />
              {{ $t('SMTPlantAdd.query') }}
            </Button>
            <Button
              v-if="exportShow"
              type="primary"
              :disabled="!canSearchOrExport"
              @click="handleExport"
            >
              <Icon icon="mdi:export" class="mr-1" />
              {{ $t('SMTPlantAdd.export') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 主表格 -->
    <Card v-show="tableShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">{{ $t('SMTPlantAdd.dailyPlanAndCompletionOverview') }}</h3>
        <Button v-if="addShow" type="primary" @click="handleCreate">
          <Icon icon="mdi:plus" class="mr-1" />
          {{ $t('SMTPlantAdd.add') }}
        </Button>
      </div>
      <Grid>
        <template #subProductName="{ row }">
          <span class="cursor-pointer text-blue-500" @click="handleDetail(row)">
            {{ row.subProductName }}
          </span>
        </template>
        <template #productPlan="{ row }">
          <span>{{
            row.productPlan === false
              ? $t('SMTPlantAdd.part')
              : row.productPlan === true
                ? $t('SMTPlantAdd.product')
                : ''
          }}</span>
        </template>
      </Grid>
    </Card>

    <!-- 详情表格 -->
    <Card v-if="detailShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">{{ $t('SMTPlantAdd.reportDetails') }}</h3>
        <Button v-if="exportShow" type="primary" @click="handleExportDetail">
          <Icon icon="mdi:export" class="mr-1" />
          {{ $t('SMTPlantAdd.export') }}
        </Button>
      </div>
      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <TabPane key="first" :tab="$t('SMTPlantAdd.readCodeReport')">
          <DetailGrid>
            <template #partOrProduct="{ row }">
              <span>{{
                row.partOrProduct === 1
                  ? $t('SMTPlantAdd.part')
                  : row.partOrProduct === 2
                    ? $t('SMTPlantAdd.product')
                    : ''
              }}</span>
            </template>
            <template #isLater="{ row }">
              <span>{{
                row.isLater === 2 ? $t('SMTPlantAdd.yes') : row.isLater === 1 ? $t('SMTPlantAdd.no') : ''
              }}</span>
            </template>
            <template #dataType="{ row }">
              <span>{{
                row.dataType === 1 ? $t('SMTPlantAdd.readCode') : row.dataType === 2 ? $t('SMTPlantAdd.redFlush') : ''
              }}</span>
            </template>
          </DetailGrid>
        </TabPane>
        <TabPane key="second" :tab="$t('SMTPlantAdd.manualReport')">
          <DetailGrid>
            <template #partOrProduct="{ row }">
              <span>{{
                row.partOrProduct === 1
                  ? $t('SMTPlantAdd.part')
                  : row.partOrProduct === 2
                    ? $t('SMTPlantAdd.product')
                    : ''
              }}</span>
            </template>
            <template #isLater="{ row }">
              <span>{{
                row.isLater === 2 ? $t('SMTPlantAdd.yes') : row.isLater === 1 ? $t('SMTPlantAdd.no') : ''
              }}</span>
            </template>
            <template #dataType="{ row }">
              <span>{{
                row.dataType === 1 ? $t('SMTPlantAdd.readCode') : row.dataType === 2 ? $t('SMTPlantAdd.redFlush') : ''
              }}</span>
            </template>
          </DetailGrid>
        </TabPane>
      </Tabs>
    </Card>

    <!-- 新增报工记录弹窗 -->
    <Drawer
      v-model:open="dialogFormVisible"
      :mask-closable="false"
      :title="$t('SMTPlantAdd.addReportRecord')"
      width="90%"
    >
      <Form :model="popData" :rules="dialogRules" layout="vertical">
        <FormItem :label="$t('SMTPlantAdd.reportDate')" name="reportDate">
          <Input v-model:value="popData.reportDate" disabled />
        </FormItem>

        <div class="grid grid-cols-2 gap-4">
          <FormItem :label="$t('SMTPlantAdd.reportProcess')" name="processName">
            <Input v-model:value="popData.processName" disabled />
          </FormItem>
          <FormItem :label="$t('SMTPlantAdd.taskLine')" name="lineName">
            <Input v-model:value="popData.lineName" disabled />
          </FormItem>
        </div>

        <Card :title="$t('SMTPlantAdd.selectWorkOrder')" style="margin-bottom: 16px">
          <Form layout="inline">
            <FormItem :label="$t('SMTPlantAdd.workOrderCode')">
              <Input
                v-model:value="workSheetCode1"
                allow-clear
                :placeholder="$t('SMTPlantAdd.pleaseInputWorkOrderCode')"
                style="width: 200px"
              />
            </FormItem>
            <FormItem :label="$t('SMTPlantAdd.partPlanCode')">
              <Input
                v-model:value="partPlanCode1"
                allow-clear
                :placeholder="$t('SMTPlantAdd.pleaseInputPartPlanCode')"
                style="width: 200px"
              />
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleSearchWorkorder">
                {{ $t('SMTPlantAdd.queryWorkOrder') }}
              </Button>
            </FormItem>
          </Form>
          <WorkorderGrid>
            <template #isProductPlan="{ row }">
              <span>{{
                row.isProductPlan === false
                  ? $t('SMTPlantAdd.part')
                  : row.isProductPlan === true
                    ? $t('SMTPlantAdd.product')
                    : ''
              }}</span>
            </template>
          </WorkorderGrid>
        </Card>

        <div class="grid grid-cols-2 gap-4">
          <FormItem :label="$t('SMTPlantAdd.workOrderPlanQuantity')">
            <span>{{ popData.workSheetPlanNumber }}</span>
          </FormItem>
          <FormItem :label="$t('SMTPlantAdd.workOrderCompletedQuantity')">
            <span>{{ popData.workSheetFinishNumber }}</span>
          </FormItem>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormItem :label="$t('SMTPlantAdd.partPlanQuantity')">
            <span>{{ popData.subPlanNumber }}</span>
          </FormItem>
          <FormItem :label="$t('SMTPlantAdd.partPlanCompletedQuantity')">
            <span>{{ popData.subPlanFinishNumber }}</span>
          </FormItem>
        </div>

        <FormItem :label="$t('SMTPlantAdd.reportTimeSlot')" name="reportTimeQuantum">
          <Select
            v-model:value="popData.reportTimeQuantum"
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
            style="width: 100%"
          >
            <SelectOption v-for="item in bgTime" :key="item" :value="item">
              {{ item }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem :label="$t('SMTPlantAdd.inputQuantity')" name="number">
          <InputNumber
            v-model:value="popData.number"
            :max="999999999999"
            :min="0"
            :placeholder="$t('SMTPlantAdd.pleaseInputQuantity')"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="dialogFormVisible = false">{{ $t('SMTPlantAdd.cancel') }}</Button>
          <Button type="primary" @click="handleSubmit">{{ $t('SMTPlantAdd.save') }}</Button>
        </Space>
      </template>
    </Drawer>
  </Page>
</template>

<style scoped>
.SMTPlantAdd :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
