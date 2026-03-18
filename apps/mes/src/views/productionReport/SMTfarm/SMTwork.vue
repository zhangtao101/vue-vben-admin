<script lang="ts" setup>
/**
 * SMT车间工单查询页面
 * 用于管理SMT车间的工单查询和报工明细
 * 功能包括：查询工单列表、查看报工明细、导出数据
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

/* eslint-disable perfectionist/sort-imports */

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Select,
  SelectOption,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import {
  detaiCalender,
  detail,
  detailExect,
  fetchLineById,
  fetchProcessByWorkshop,
  spWorkList,
  workLiExect,
} from '#/api';

// region 主表格配置

/**
 * 主表格配置选项
 * 显示工单列表
 */
const mainColumns: any[] = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'lineName', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 100 },
  {
    field: 'workSheetCode',
    slots: { default: 'workSheetCode' },
    title: '工单编号',
    minWidth: 120,
  },
  { field: 'subProductCode', title: '部件编号', minWidth: 80 },
  {
    field: 'subProductName',
    title: '部件名称',
    minWidth: 200,
  },
  {
    field: 'isProductPlan',
    slots: { default: 'isProductPlan' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '下发日期', minWidth: 120 },
  { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 100 },
  { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 100 },
  {
    field: 'status',
    slots: { default: 'status' },
    title: '工单状态',
    minWidth: 80,
  },
  { field: 'onTimeFinishNumber', title: '下发日完成数', minWidth: 100 },
  {
    field: 'delayStatus',
    slots: { default: 'delayStatus' },
    title: '延时状态',
    minWidth: 80,
  },
  { field: 'delayFinishNumber', title: '延时完成数', minWidth: 100 },
  { field: 'subPlanCode', title: '部件计划号', minWidth: 100 },
  { field: 'updateTime', title: '操作时间', minWidth: 120 },
  { field: 'updateUsername', title: '操作人', minWidth: 80 },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: mainColumns,
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await handleMainTableQuery({
          page: page.currentPage,
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
 * 人工报工明细表格配置
 */
const detailColumns: any[] = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'taskLine', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 100 },
  { field: 'workSheetCode', title: '工单编号', minWidth: 100 },
  { field: 'partCode', title: '部件编号', minWidth: 80 },
  { field: 'partName', title: '部件名称', minWidth: 130 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '下发日期', minWidth: 100 },
  { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 100 },
  { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: '延时',
    minWidth: 100,
  },
  { field: 'reportDate', title: '报工日期', minWidth: 90 },
  { field: 'reportTimeQuantum', title: '报工时段', minWidth: 120 },
  { field: 'qcCode', title: '二维码', minWidth: 130 },
  { field: 'reportNumber', title: '报工数', minWidth: 80 },
  { field: 'partPlanCode', title: '部件计划号', minWidth: 100 },
  { field: 'partPlanNumber', title: '计划完成数', minWidth: 100 },
  { field: 'partPlanFinishNumber', title: '计划已完成数', minWidth: 100 },
  { field: 'productName', title: '产品名称', minWidth: 100 },
  { field: 'productPlanCode', title: '产品计划号', minWidth: 100 },
  { field: 'createTime', title: '操作时间', minWidth: 160 },
  { field: 'createUserName', title: '操作人', minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: '数据来源',
    minWidth: 80,
  },
];

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: detailColumns,
  data: [],
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50],
  },
  stripe: true,
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

// endregion 详情表格配置

// region 状态定义

const detailShow = ref(false);
const activeTab = ref<string>('second');

// 工单状态选项
const workSheetStatusOptions = [
  { type: '0', label: '已完成' },
  { type: '1', label: '未生产' },
  { type: '2', label: '生产中' },
  { type: '3', label: '足额完成' },
  { type: '4', label: '欠额完成' },
  { type: '5', label: '未完成' },
  { type: '6', label: '超额完成' },
];

// 部件/产品选项
const productOptions = [
  { value: '1', label: '部件' },
  { value: '2', label: '产品' },
];

// 延时状态选项
const delayStatusOptions = [
  { value: '1', label: '延时欠额' },
  { value: '3', label: '延时足额' },
  { value: '2', label: '延时超额' },
];

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined);

// 查询表单
const listQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  workSheetStatus: '5',
  produceWorkshop: '1',
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  workSheetCode: undefined as string | undefined,
  processCode: undefined as string | undefined,
  taskLineCode: undefined as string | undefined,
  partName: undefined as string | undefined,
  partOrProduct: undefined as string | undefined,
  laterStatus: undefined as string | undefined,
});

// 详情查询表单
const detailQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  workSheetCode: undefined as string | undefined,
});

// 工序列表和产线列表
const planProcess = ref<any[]>([]);
const taskLineList = ref<any[]>([]);
let processId = '';

// 表单验证规则
const rules: any = {
  startDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
};

// endregion 状态定义

// region 方法定义

/**
 * 主表格查询
 */
function handleMainTableQuery({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...listQuery,
      pageNum: page,
      pageSize,
    };
    spWorkList(params)
      .then(({ total, list }) => {
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 获取默认日期范围
 */
function getDefaultDateRange() {
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const startDate = formatDate(new Date());
  const params = { workshop: 2 };

  detaiCalender(params)
    .then((data: any) => {
      const endDate = data.endDate;
      dateRange.value = [startDate, endDate];
      listQuery.startDate = startDate;
      listQuery.endDate = endDate;
    })
    .catch((error: any) => {
      message.error(error.message || '获取日期范围失败');
    });
}

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
  listQuery.taskLineCode = undefined;

  planProcess.value.forEach((item) => {
    if (item.processCode === listQuery.processCode) {
      processId = item.id;
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
 * 日期范围变更
 */
function handleDateRangeChange() {
  if (dateRange.value && dateRange.value.length === 2) {
    listQuery.startDate = dateRange.value[0];
    listQuery.endDate = dateRange.value[1];
  } else {
    listQuery.startDate = undefined;
    listQuery.endDate = undefined;
  }
}

/**
 * 查询
 */
function handleSearch() {
  if (!listQuery.startDate || !listQuery.endDate) {
    message.warning('请选择日期');
    return;
  }
  gridApi.reload();
  detailShow.value = false;
}

/**
 * 导出主表格
 */
function handleExport() {
  workLiExect(listQuery)
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
  detailQuery.workSheetCode = row.workSheetCode;
  detailShow.value = true;
  loadDetailData();
}

/**
 * Tab 切换
 */
function handleTabChange(key: number | string) {
  activeTab.value = String(key);
}

/**
 * 加载报工明细数据
 */
function loadDetailData() {
  detail(detailQuery)
    .then((data: any) => {
      detailGridApi.grid.reloadData(data.list);
    })
    .catch((error: any) => {
      message.error(error.message || '加载报工明细失败');
    });
}

/**
 * 导出报工明细
 */
function handleExportDetail() {
  const params = {
    workSheetCode: detailQuery.workSheetCode,
  };
  detailExect(params)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || '导出失败');
    });
}

/**
 * 分页变更
 */
function handlePageChange({ currentPage, pageSize }: any) {
  detailQuery.pageNum = currentPage;
  detailQuery.pageSize = pageSize;
  loadDetailData();
}

// endregion 方法定义

// region 生命周期

onMounted(() => {
  getDefaultDateRange();
  getProcessList();
});

// endregion 生命周期
</script>

<template>
  <Page content-class="SMTwork">
    <!-- 查询表单 -->
    <Card>
      <Form :model="listQuery" :rules="rules" layout="inline">
        <FormItem label="日期" name="startDate" class="!my-2">
          <DatePicker.RangePicker
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 230px"
            @change="handleDateRangeChange"
          />
        </FormItem>
        <FormItem label="工单编号" class="!my-2">
          <Input
            v-model:value="listQuery.workSheetCode"
            allow-clear
            placeholder="请输入工单编号"
            class="!w-48"
          />
        </FormItem>
        <FormItem label="报工工序" class="!my-2">
          <Select
            v-model:value="listQuery.processCode"
            allow-clear
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
        <FormItem label="选择任务线" class="!my-2">
          <Select
            v-model:value="listQuery.taskLineCode"
            allow-clear
            placeholder="请选择"
            class="!w-48"
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
        <FormItem label="工单状态" class="!my-2">
          <Select
            v-model:value="listQuery.workSheetStatus"
            allow-clear
            placeholder="请选择"
            class="!w-48"
          >
            <SelectOption
              v-for="item in workSheetStatusOptions"
              :key="item.type"
              :value="item.type"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="部件名称" class="!my-2">
          <Input
            v-model:value="listQuery.partName"
            allow-clear
            placeholder="请输入部件名称"
            class="!w-48"
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
              v-for="item in productOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="延时状态" class="!my-2">
          <Select
            v-model:value="listQuery.laterStatus"
            allow-clear
            placeholder="请选择"
            class="!w-48"
          >
            <SelectOption
              v-for="item in delayStatusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">
              <Icon icon="mdi:search" class="mr-1" />
              查询
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 主表格 -->
    <Card style="margin-top: 16px">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">工单列表</h3>
        <Button type="primary" @click="handleExport">
          <Icon icon="mdi:export" class="mr-1" />
          导出
        </Button>
      </div>
      <Grid>
        <template #workSheetCode="{ row }">
          <span
            class="cursor-pointer text-blue-500 underline"
            @click="handleDetail(row)"
          >
            {{ row.workSheetCode }}
          </span>
        </template>
        <template #isProductPlan="{ row }">
          <span>{{
            row.isProductPlan === false
              ? '部件'
              : row.isProductPlan === true
                ? '产品'
                : ''
          }}</span>
        </template>
        <template #status="{ row }">
          <span>{{
            row.status === 0
              ? '已完成'
              : row.status === 1
                ? '未生产'
                : row.status === 2
                  ? '生产中'
                  : row.status === 3
                    ? '足额完成'
                    : row.status === 4
                      ? '欠额完成'
                      : row.status === 5
                        ? '未完成'
                        : row.status === 6
                          ? '超额完成'
                          : ''
          }}</span>
        </template>
        <template #delayStatus="{ row }">
          <span>{{
            row.delayStatus === 1
              ? '延时欠额'
              : row.delayStatus === 2
                ? '延时超额'
                : row.delayStatus === 3
                  ? '延时足额'
                  : ''
          }}</span>
        </template>
      </Grid>
    </Card>

    <!-- 详情表格 -->
    <Card v-if="detailShow" style="margin-top: 16px">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">报工明细</h3>
        <Button type="primary" @click="handleExportDetail">
          <Icon icon="mdi:export" class="mr-1" />
          导出
        </Button>
      </div>
      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <TabPane key="second" tab="人工报工">
          <DetailGrid @page-change="handlePageChange">
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
                row.dataType === 1
                  ? '读码'
                  : row.dataType === 2
                    ? '冲红'
                    : row.dataType === 3
                      ? ''
                      : ''
              }}</span>
            </template>
          </DetailGrid>
        </TabPane>
      </Tabs>
    </Card>
  </Page>
</template>

<style scoped>
.SMTwork :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
