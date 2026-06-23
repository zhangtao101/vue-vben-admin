<script lang="ts" setup>
/**
 * SMT车间工单查询页面
 * 用于管理SMT车间的工单查询和报工明细
 * 功能包括：查询工单列表、查看报工明细、导出数据
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

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
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  { field: 'lineName', title: $t('SMTPlantAdd.taskLine'), minWidth: 100 },
  { field: 'processName', title: $t('SMTPlantAdd.processName'), minWidth: 150 },
  {
    field: 'workSheetCode',
    slots: { default: 'workSheetCode' },
    title: $t('SMTPlantAdd.workSheetCode'),
    minWidth: 150,
  },
  { field: 'subProductCode', title: $t('SMTPlantAdd.subProductCode'), minWidth: 80 },
  {
    field: 'subProductName',
    title: $t('SMTPlantAdd.subProductName'),
    minWidth: 200,
  },
  {
    field: 'isProductPlan',
    slots: { default: 'isProductPlan' },
    title: $t('SMTPlantAdd.isProductPlan'),
    minWidth: 80,
  },
  { field: 'planDateStart', title: $t('SMTPlantAdd.planDateStart'), minWidth: 120 },
  { field: 'workSheetPlanNumber', title: $t('SMTPlantAdd.workSheetPlanNumber'), minWidth: 100 },
  { field: 'workSheetFinishNumber', title: $t('SMTPlantAdd.workSheetFinishNumber'), minWidth: 100 },
  {
    field: 'status',
    slots: { default: 'status' },
    title: $t('SMTPlantAdd.workSheetStatus'),
    minWidth: 80,
  },
  { field: 'onTimeFinishNumber', title: $t('SMTPlantAdd.onTimeFinishNumber'), minWidth: 100 },
  {
    field: 'delayStatus',
    slots: { default: 'delayStatus' },
    title: $t('SMTPlantAdd.delayStatus'),
    minWidth: 80,
  },
  { field: 'delayFinishNumber', title: $t('SMTPlantAdd.delayFinishNumber'), minWidth: 100 },
  { field: 'subPlanCode', title: $t('SMTPlantAdd.subPlanCode'), minWidth: 100 },
  { field: 'updateTime', title: $t('SMTPlantAdd.updateTime'), minWidth: 120 },
  { field: 'updateUsername', title: $t('SMTPlantAdd.updateUsername'), minWidth: 80 },
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
  showOverflow: 'tooltip',
  stripe: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// endregion 主表格配置

// region 详情表格配置

/**
 * 人工报工明细表格配置
 */
const detailColumns: any[] = [
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  { field: 'taskLine', title: $t('SMTPlantAdd.taskLine'), minWidth: 100 },
  { field: 'processName', title: $t('SMTPlantAdd.processName'), minWidth: 200 },
  { field: 'workSheetCode', title: $t('SMTPlantAdd.workSheetCode'), minWidth: 150 },
  { field: 'partCode', title: $t('SMTPlantAdd.partCode'), minWidth: 80 },
  { field: 'partName', title: $t('SMTPlantAdd.partName'), minWidth: 200 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: $t('SMTPlantAdd.partOrProduct'),
    minWidth: 80,
  },
  { field: 'planDateStart', title: $t('SMTPlantAdd.planDateStart'), minWidth: 100 },
  { field: 'workSheetPlanNumber', title: $t('SMTPlantAdd.workSheetPlanNumber'), minWidth: 100 },
  { field: 'workSheetFinishNumber', title: $t('SMTPlantAdd.workSheetFinishNumber'), minWidth: 100 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: $t('SMTPlantAdd.isLater'),
    minWidth: 100,
  },
  { field: 'reportDate', title: $t('SMTPlantAdd.reportDate'), minWidth: 90 },
  { field: 'reportTimeQuantum', title: $t('SMTPlantAdd.reportTimeQuantum'), minWidth: 120 },
  { field: 'qcCode', title: $t('SMTPlantAdd.qcCode'), minWidth: 130 },
  { field: 'reportNumber', title: $t('SMTPlantAdd.reportNumber'), minWidth: 80 },
  { field: 'partPlanCode', title: $t('SMTPlantAdd.partPlanCode'), minWidth: 100 },
  { field: 'partPlanNumber', title: $t('SMTPlantAdd.partPlanNumber'), minWidth: 100 },
  { field: 'partPlanFinishNumber', title: $t('SMTPlantAdd.partPlanFinishNumber'), minWidth: 100 },
  { field: 'productName', title: $t('SMTPlantAdd.productName'), minWidth: 180 },
  { field: 'productPlanCode', title: $t('SMTPlantAdd.productPlanCode'), minWidth: 150 },
  { field: 'createTime', title: $t('SMTPlantAdd.createTime'), minWidth: 160 },
  { field: 'createUserName', title: $t('SMTPlantAdd.createUserName'), minWidth: 80 },
  {
    field: 'dataType',
    slots: { default: 'dataType' },
    title: $t('SMTPlantAdd.dataType'),
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
  showOverflow: 'tooltip',
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
  { type: '0', label: $t('SMTPlantAdd.completed') },
  { type: '1', label: $t('SMTPlantAdd.notProduced') },
  { type: '2', label: $t('SMTPlantAdd.inProduction') },
  { type: '3', label: $t('SMTPlantAdd.fullyCompleted') },
  { type: '4', label: $t('SMTPlantAdd.underCompleted') },
  { type: '5', label: $t('SMTPlantAdd.notCompleted') },
  { type: '6', label: $t('SMTPlantAdd.overCompleted') },
];

// 部件/产品选项
const productOptions = [
  { value: '1', label: $t('SMTPlantAdd.part') },
  { value: '2', label: $t('SMTPlantAdd.product') },
];

// 延时状态选项
const delayStatusOptions = [
  { value: '1', label: $t('SMTPlantAdd.delayUnderCompleted') },
  { value: '3', label: $t('SMTPlantAdd.delayFullyCompleted') },
  { value: '2', label: $t('SMTPlantAdd.delayOverCompleted') },
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
  startDate: [{ required: true, message: $t('SMTPlantAdd.pleaseSelectDate'), trigger: 'change' }],
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
      message.error(error.message || $t('SMTPlantAdd.loadCalendarDataFailed'));
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
      message.error(error.message || $t('SMTPlantAdd.getProcessListFailed'));
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
        message.error(error.message || $t('SMTPlantAdd.getLineListFailed'));
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
    message.warning($t('SMTPlantAdd.pleaseSelectDate'));
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
      message.error(error.message || $t('SMTPlantAdd.exportFailed'));
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
      message.error(error.message || $t('SMTPlantAdd.loadDetailDataFailed'));
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
      message.error(error.message || $t('SMTPlantAdd.exportFailed'));
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
        <FormItem :label="$t('SMTPlantAdd.selectDate')" name="startDate" class="!my-2">
          <DatePicker.RangePicker
            v-model:value="dateRange"
            :placeholder="[$t('SMTPlantAdd.startDate'), $t('SMTPlantAdd.endDate')]"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 230px"
            @change="handleDateRangeChange"
          />
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.workOrderCodeQuery')" class="!my-2">
          <Input
            v-model:value="listQuery.workSheetCode"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseInputWorkOrderCode')"
            class="!w-48"
          />
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.selectProcess')" class="!my-2">
          <Select
            v-model:value="listQuery.processCode"
            allow-clear
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
        <FormItem :label="$t('SMTPlantAdd.pleaseSelectTaskLine')" class="!my-2">
          <Select
            v-model:value="listQuery.taskLineCode"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
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
        <FormItem :label="$t('SMTPlantAdd.workOrderStatusQuery')" class="!my-2">
          <Select
            v-model:value="listQuery.workSheetStatus"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
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
        <FormItem :label="$t('SMTPlantAdd.partNameQuery')" class="!my-2">
          <Input
            v-model:value="listQuery.partName"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseInputPartName')"
            class="!w-48"
          />
        </FormItem>
        <FormItem :label="$t('SMTPlantAdd.partOrProductQuery')" class="!my-2">
          <Select
            v-model:value="listQuery.partOrProduct"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
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
        <FormItem :label="$t('SMTPlantAdd.delayStatusQuery')" class="!my-2">
          <Select
            v-model:value="listQuery.laterStatus"
            allow-clear
            :placeholder="$t('SMTPlantAdd.pleaseSelect')"
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
              {{ $t('SMTPlantAdd.query') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <!-- 主表格 -->
    <Card style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">{{ $t('SMTPlantAdd.workOrderList') }}</h3>
        <Button type="primary" @click="handleExport">
          <Icon icon="mdi:export" class="mr-1" />
          {{ $t('SMTPlantAdd.export') }}
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
              ? $t('SMTPlantAdd.part')
              : row.isProductPlan === true
                ? $t('SMTPlantAdd.product')
                : ''
          }}</span>
        </template>
        <template #status="{ row }">
          <span>{{
            row.status === 0
              ? $t('SMTPlantAdd.completed')
              : row.status === 1
                ? $t('SMTPlantAdd.notProduced')
                : row.status === 2
                  ? $t('SMTPlantAdd.inProduction')
                  : row.status === 3
                    ? $t('SMTPlantAdd.fullyCompleted')
                    : row.status === 4
                      ? $t('SMTPlantAdd.underCompleted')
                      : row.status === 5
                        ? $t('SMTPlantAdd.notCompleted')
                        : row.status === 6
                          ? $t('SMTPlantAdd.overCompleted')
                          : ''
          }}</span>
        </template>
        <template #delayStatus="{ row }">
          <span>{{
            row.delayStatus === 1
              ? $t('SMTPlantAdd.delayUnderCompleted')
              : row.delayStatus === 2
                ? $t('SMTPlantAdd.delayOverCompleted')
                : row.delayStatus === 3
                  ? $t('SMTPlantAdd.delayFullyCompleted')
                  : ''
          }}</span>
        </template>
      </Grid>
    </Card>

    <!-- 详情表格 -->
    <Card v-if="detailShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">{{ $t('SMTPlantAdd.reportDetails') }}</h3>
        <Button type="primary" @click="handleExportDetail">
          <Icon icon="mdi:export" class="mr-1" />
          {{ $t('SMTPlantAdd.export') }}
        </Button>
      </div>
      <Tabs v-model:active-key="activeTab" @change="handleTabChange">
        <TabPane key="second" :tab="$t('SMTPlantAdd.manualReport')">
          <DetailGrid @page-change="handlePageChange">
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
                row.dataType === 1
                  ? $t('SMTPlantAdd.readCode')
                  : row.dataType === 2
                    ? $t('SMTPlantAdd.redFlush')
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
