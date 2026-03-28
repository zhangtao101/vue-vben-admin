<script lang="ts" setup>
/**
 * SMT车间报工页面
 * 用于管理SMT车间的报工记录
 * 功能包括：查询本日计划与完成情况、查看报工明细、新增报工记录
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

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
  { title: '序号', type: 'seq', width: 50 },
  { field: 'lineName', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 80 },
  { field: 'subProductCode', title: '部件编号', minWidth: 80 },
  {
    field: 'subProductName',
    slots: { default: 'subProductName' },
    title: '部件名称',
    minWidth: 200,
  },
  {
    field: 'productPlan',
    slots: { default: 'productPlan' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'subPlanCode', title: '部件计划号', minWidth: 100 },
  { field: 'dayPlanNumber', title: '本日计划数', minWidth: 100 },
  { field: 'dayFinishNumber', title: '本日完成数', minWidth: 100 },
  { field: 'updateTime', title: '操作时间', minWidth: 135 },
  { field: 'updateUser', title: '操作人', minWidth: 80 },
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
  { title: '序号', type: 'seq', width: 50 },
  { field: 'taskLine', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 80 },
  { field: 'workSheetCode', title: '工单编号', minWidth: 120 },
  { field: 'partCode', title: '部件编号', minWidth: 80 },
  { field: 'partName', title: '部件名称', minWidth: 150 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '下发日期', minWidth: 90 },
  { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 100 },
  { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: '延时',
    minWidth: 60,
  },
  { field: 'reportDate', title: '报工日期', minWidth: 90 },
  { field: 'reportTimeQuantum', title: '报工时段', minWidth: 90 },
  { field: 'qcCode', title: '二维码', minWidth: 80 },
  { field: 'reportNumber', title: '报工数', minWidth: 80 },
  { field: 'partPlanCode', title: '部件计划号', minWidth: 100 },
  { field: 'partPlanNumber', title: '计划完成数', minWidth: 100 },
  { field: 'partPlanFinishNumber', title: '计划已完成数', minWidth: 120 },
  { field: 'productName', title: '产品名称', minWidth: 150 },
  { field: 'productPlanCode', title: '产品计划号', minWidth: 120 },
  { field: 'createTime', title: '操作时间', minWidth: 135 },
  { field: 'createUserName', title: '操作人', minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: '数据来源',
    minWidth: 80,
  },
];

/**
 * 人工报工明细表格配置
 */
const manualReportColumns: any[] = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'taskLine', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 80 },
  { field: 'workSheetCode', title: '工单编号', minWidth: 120 },
  { field: 'partCode', title: '部件编号', minWidth: 80 },
  { field: 'partName', title: '部件名称', minWidth: 150 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '下发日期', minWidth: 90 },
  { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 100 },
  { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: '延时',
    minWidth: 60,
  },
  { field: 'reportDate', title: '报工日期', minWidth: 90 },
  { field: 'reportTimeQuantum', title: '报工时段', minWidth: 90 },
  { field: 'qcCode', title: '二维码', minWidth: 80 },
  { field: 'reportNumber', title: '报工数', minWidth: 80 },
  { field: 'partPlanCode', title: '部件计划号', minWidth: 90 },
  { field: 'partPlanNumber', title: '计划完成数', minWidth: 90 },
  { field: 'partPlanFinishNumber', title: '计划已完成数', minWidth: 100 },
  { field: 'productName', title: '产品名称', minWidth: 150 },
  { field: 'productPlanCode', title: '产品计划号', minWidth: 120 },
  { field: 'createTime', title: '操作时间', minWidth: 135 },
  { field: 'createUserName', title: '操作人', minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: '数据来源',
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
  { field: 'workSheetCode', title: '工单编号', minWidth: 150 },
  { field: 'sideNo', title: '面号', minWidth: 150 },
  {
    field: 'subProductName',
    title: '部件名称',
    minWidth: 150,
  },
  { field: 'subPlanCode', title: '部件计划号', minWidth: 150 },
  {
    field: 'isProductPlan',
    slots: { default: 'isProductPlan' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '工单日期', minWidth: 150 },
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
  { label: '部件', value: 1 },
  { label: '产品', value: 2 },
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
  reportDate: [{ required: true, message: '此项为必填项', trigger: 'change' }],
  processCode: [{ required: true, message: '此项为必填项', trigger: 'change' }],
  taskLineCode: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
};

const dialogRules: any = {
  workSheetCode: [{ required: true, message: '请选择工单', trigger: 'change' }],
  reportTimeQuantum: [
    { required: true, message: '此项为必填项', trigger: 'change' },
  ],
  number: [{ required: true, message: '此项为必填项', trigger: 'change' }],
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
      message.error(error.message || '获取工序列表失败');
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
        message.error(error.message || '获取产线列表失败');
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
      message.error(error.message || '导出失败');
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
      message.error(error.message || '加载读码报工数据失败');
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
      message.error(error.message || '加载人工报工数据失败');
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
      message.error(error.message || '导出失败');
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
      message.error(error.message || '获取工单列表失败');
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
    message.warning('请选择工单');
    return;
  }
  const tempData = {
    number: popData.number,
    reportTimeQuantum: popData.reportTimeQuantum,
    workSheetCode: popData.workSheetCode,
  };
  createArticle(tempData)
    .then(() => {
      message.success('保存成功');
      dialogFormVisible.value = false;
      handleSearch();
    })
    .catch((error: any) => {
      message.error(error.message || '保存失败');
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
        <FormItem label="报工日期" name="reportDate" class="!my-2">
          <DatePicker
            v-model:value="listQuery.reportDate"
            disabled
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </FormItem>
        <FormItem label="报工工序" name="processCode" class="!my-2">
          <Select
            v-model:value="listQuery.processCode"
            placeholder="请选择"
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
        <FormItem label="任务线别" name="taskLineCode" class="!my-2">
          <Select
            v-model:value="listQuery.taskLineCode"
            placeholder="请选择"
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
        <FormItem label="部件名称" class="!my-2">
          <Input
            v-model:value="listQuery.partName"
            allow-clear
            placeholder="请输入"
            class="!w-48"
            @press-enter="handleSearch"
          />
        </FormItem>
        <FormItem label="部件/产品" class="!my-2">
          <Select
            v-model:value="listQuery.partOrProduct"
            allow-clear
            placeholder="请选择"
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
              查询
            </Button>
            <Button
              v-if="exportShow"
              type="primary"
              :disabled="!canSearchOrExport"
              @click="handleExport"
            >
              <Icon icon="mdi:export" class="mr-1" />
              导出
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 主表格 -->
    <Card v-show="tableShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">本日计划与完成情况一览</h3>
        <Button v-if="addShow" type="primary" @click="handleCreate">
          <Icon icon="mdi:plus" class="mr-1" />
          新增
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
              ? '部件'
              : row.productPlan === true
                ? '产品'
                : ''
          }}</span>
        </template>
      </Grid>
    </Card>

    <!-- 详情表格 -->
    <Card v-if="detailShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">报工明细</h3>
        <Button v-if="exportShow" type="primary" @click="handleExportDetail">
          <Icon icon="mdi:export" class="mr-1" />
          导出
        </Button>
      </div>
      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <TabPane key="first" tab="读码报工">
          <DetailGrid>
            <template #partOrProduct="{ row }">
              <span>{{
                row.partOrProduct === 1
                  ? '部件'
                  : row.partOrProduct === 2
                    ? '产品'
                    : ''
              }}</span>
            </template>
            <template #isLater="{ row }">
              <span>{{
                row.isLater === 2 ? '是' : row.isLater === 1 ? '否' : ''
              }}</span>
            </template>
            <template #dataType="{ row }">
              <span>{{
                row.dataType === 1 ? '读码' : row.dataType === 2 ? '冲红' : ''
              }}</span>
            </template>
          </DetailGrid>
        </TabPane>
        <TabPane key="second" tab="人工报工">
          <DetailGrid>
            <template #partOrProduct="{ row }">
              <span>{{
                row.partOrProduct === 1
                  ? '部件'
                  : row.partOrProduct === 2
                    ? '产品'
                    : ''
              }}</span>
            </template>
            <template #isLater="{ row }">
              <span>{{
                row.isLater === 2 ? '是' : row.isLater === 1 ? '否' : ''
              }}</span>
            </template>
            <template #dataType="{ row }">
              <span>{{
                row.dataType === 1 ? '读码' : row.dataType === 2 ? '冲红' : ''
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
      title="新增报工记录"
      width="90%"
    >
      <Form :model="popData" :rules="dialogRules" layout="vertical">
        <FormItem label="报工日期" name="reportDate">
          <Input v-model:value="popData.reportDate" disabled />
        </FormItem>

        <div class="grid grid-cols-2 gap-4">
          <FormItem label="报工工序" name="processName">
            <Input v-model:value="popData.processName" disabled />
          </FormItem>
          <FormItem label="任务线别" name="lineName">
            <Input v-model:value="popData.lineName" disabled />
          </FormItem>
        </div>

        <Card title="选择工单" style="margin-bottom: 16px">
          <Form layout="inline">
            <FormItem label="工单编号">
              <Input
                v-model:value="workSheetCode1"
                allow-clear
                placeholder="请输入工单编号"
                style="width: 200px"
              />
            </FormItem>
            <FormItem label="部件计划号">
              <Input
                v-model:value="partPlanCode1"
                allow-clear
                placeholder="请输入部件计划号"
                style="width: 200px"
              />
            </FormItem>
            <FormItem>
              <Button type="primary" @click="handleSearchWorkorder">
                查询工单
              </Button>
            </FormItem>
          </Form>
          <WorkorderGrid>
            <template #isProductPlan="{ row }">
              <span>{{
                row.isProductPlan === false
                  ? '部件'
                  : row.isProductPlan === true
                    ? '产品'
                    : ''
              }}</span>
            </template>
          </WorkorderGrid>
        </Card>

        <div class="grid grid-cols-2 gap-4">
          <FormItem label="工单计划数">
            <span>{{ popData.workSheetPlanNumber }}</span>
          </FormItem>
          <FormItem label="工单完成数">
            <span>{{ popData.workSheetFinishNumber }}</span>
          </FormItem>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormItem label="部件计划计划数">
            <span>{{ popData.subPlanNumber }}</span>
          </FormItem>
          <FormItem label="部件计划已完成数">
            <span>{{ popData.subPlanFinishNumber }}</span>
          </FormItem>
        </div>

        <FormItem label="报工时段" name="reportTimeQuantum">
          <Select
            v-model:value="popData.reportTimeQuantum"
            placeholder="请选择"
            style="width: 100%"
          >
            <SelectOption v-for="item in bgTime" :key="item" :value="item">
              {{ item }}
            </SelectOption>
          </Select>
        </FormItem>

        <FormItem label="输入数量" name="number">
          <InputNumber
            v-model:value="popData.number"
            :max="999999999999"
            :min="0"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </FormItem>
      </Form>

      <template #footer>
        <Space>
          <Button @click="dialogFormVisible = false">取消</Button>
          <Button type="primary" @click="handleSubmit">保存</Button>
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
