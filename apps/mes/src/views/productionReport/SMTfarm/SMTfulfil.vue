<script lang="ts" setup>
/**
 * SMT计划完成情况一览页面
 * 用于查看月度汇总和计划汇总
 * 功能包括：月度汇总查询、计划汇总查询、查看报工明细、导出数据
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
  Drawer,
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
  fetchLineById,
  fetchProcessByWorkshop,
  manList,
  mouthExelect,
  mouthList,
  plotExect,
  plotList,
  tan_pltyExect,
} from '#/api';

// region 月度汇总表格配置

/**
 * 月度汇总表格配置
 * 动态列，根据月份天数生成
 */
const monthColumns = ref<any[]>([]);
const monthGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: monthColumns.value,
  data: [],
  height: 300,
  pagerConfig: {
    enabled: false,
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [MonthGrid, monthGridApi] = useVbenVxeGrid({
  gridOptions: monthGridOptions,
});

// endregion 月度汇总表格配置

// region 计划汇总表格配置

/**
 * 计划汇总表格配置
 * 动态列，根据月份天数生成
 */
const planColumns = ref<any[]>([]);
const planGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: planColumns.value,
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await handlePlanQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
};

const [PlanGrid, planGridApi] = useVbenVxeGrid({
  gridOptions: planGridOptions,
});

// endregion 计划汇总表格配置

// region 报工明细表格配置

/**
 * 报工明细表格配置
 */
const detailColumns: any[] = [
  { title: '序号', type: 'seq', width: 50 },
  { field: 'taskLine', title: '任务线别', minWidth: 100 },
  { field: 'processName', title: '报工工序', minWidth: 200 },
  { field: 'workSheetCode', title: '工单编号', minWidth: 150 },
  { field: 'partCode', title: '部件编号', minWidth: 120 },
  { field: 'partName', title: '部件名称', minWidth: 200 },
  {
    field: 'partOrProduct',
    slots: { default: 'partOrProduct' },
    title: '部件/产品',
    minWidth: 80,
  },
  { field: 'planDateStart', title: '下发日期', minWidth: 150 },
  { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 80 },
  { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 80 },
  {
    field: 'isLater',
    slots: { default: 'isLater' },
    title: '延时',
    minWidth: 80,
  },
  { field: 'reportDate', title: '报工日期', minWidth: 150 },
  { field: 'reportTimeQuantum', title: '报工时段', minWidth: 150 },
  { field: 'qcCode', title: '二维码', minWidth: 120 },
  { field: 'reportNumber', title: '报工数', minWidth: 80 },
  { field: 'partPlanCode', title: '部件计划号', minWidth: 150 },
  { field: 'partPlanNumber', title: '计划完成数', minWidth: 120 },
  { field: 'partPlanFinishNumber', title: '计划已完成数', minWidth: 120 },
  { field: 'productName', title: '产品名称', minWidth: 200 },
  { field: 'productPlanCode', title: '产品计划号', minWidth: 120 },
  { field: 'createTime', title: '操作时间', minWidth: 150 },
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
  height: 500,
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

// endregion 报工明细表格配置

// region 状态定义

const tableShow = ref(false);
const detailShow = ref(false);
const activeTab = ref<string>('second');

// 部件/产品选项
const productOptions = [
  { value: '1', label: '部件' },
  { value: '2', label: '产品' },
];

// 查询表单
const listQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  month: undefined as string | undefined,
  processCode: undefined as string | undefined,
  taskLine: undefined as string | undefined,
  lineName: undefined as string | undefined,
  partName: undefined as string | undefined,
  planCode: undefined as string | undefined,
  isPartOrProduct: undefined as string | undefined,
  workShop: 1,
});

// 详情查询表单
const detailQuery = reactive({
  month: undefined as string | undefined,
  day: undefined as string | undefined,
  processCode: undefined as string | undefined,
  taskLineCode: undefined as string | undefined,
  partName: undefined as string | undefined,
  partCode: undefined as string | undefined,
  partPlanCode: undefined as string | undefined,
  partOrProduct: undefined as string | undefined,
  produceWorkshop: 1,
  pageNum: 1,
  pageSize: 20,
});

// 当前点击的字段
const currentField = ref<string>('');

// 工序列表和产线列表
const planProcess = ref<any[]>([]);
const taskLineList = ref<any[]>([]);
let processId = '';

// 表单验证规则
const rules: any = {
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  processCode: [
    { required: true, message: '请选择报工工序', trigger: 'change' },
  ],
};

// endregion 状态定义

// region 方法定义

/**
 * 获取默认月份
 */
function getDefaultMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  listQuery.month = `${y}-${m}`;
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
  listQuery.lineName = undefined;
  listQuery.taskLine = undefined;

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
 * 任务线别变更
 */
function handleLineChange() {
  taskLineList.value.forEach((item) => {
    if (item.lineName === listQuery.lineName) {
      listQuery.taskLine = item.id;
    }
  });
}

/**
 * 查询月度汇总
 */
function loadMonthData() {
  mouthList(listQuery)
    .then((data: any) => {
      // 动态生成列
      const columns = data.column || [];
      const cols: any[] = [{ field: 'node1', title: '', width: 80 }];

      columns.forEach((col: any) => {
        if (col.prop === 'sum') {
          cols.push({
            field: col.prop,
            title: col.label,
            minWidth: 80,
          });
        } else {
          cols.push({
            field: col.prop,
            title: col.label.slice(8, 10),
            minWidth: 80,
          });
        }
      });

      monthColumns.value = cols;
      // 更新列配置并重新加载数据
      monthGridApi.grid.loadColumn(cols);
      // 月度汇总只有一行数据（总计）
      const result = data.result || {};
      result.node1 = '总计';
      monthGridApi.grid.reloadData([result]);
    })
    .catch((error: any) => {
      message.error(error.message || '加载月度汇总失败');
    });
}

/**
 * 查询计划汇总
 */
function handlePlanQuery({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...listQuery,
      pageNum: page,
      pageSize,
    };
    plotList(params)
      .then(({ total, result, column }) => {
        // 动态生成列
        const cols: any[] = [
          { field: 'plan_code', title: '部件计划号', minWidth: 120 },
          { field: 'part_code', title: '部件编号', minWidth: 120 },
          { field: 'part_or_product', title: '部件/产品', minWidth: 120 },
          { field: 'part_name', title: '部件名称', minWidth: 240 },
        ];

        column.forEach((col: any) => {
          if (col.prop === 'sum') {
            cols.push({
              field: col.prop,
              title: col.label,
              minWidth: 80,
              slots: { default: 'sum' },
            });
          } else if (
            ![
              'part_code',
              'part_name',
              'part_or_product',
              'plan_code',
            ].includes(col.prop)
          ) {
            cols.push({
              field: col.prop,
              title: col.label.slice(8, 10),
              minWidth: 80,
              slots: { default: 'dayCell' },
            });
          }
        });

        planColumns.value = cols;
        // 更新列配置
        planGridApi.grid.loadColumn(cols);

        resolve({
          total,
          items: result,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 查询
 */
function handleSearch() {
  if (!listQuery.month) {
    message.warning('请选择月份');
    return;
  }
  if (!listQuery.processCode) {
    message.warning('请选择报工工序');
    return;
  }
  tableShow.value = true;
  loadMonthData();
  planGridApi.reload();
}

/**
 * 导出月度汇总
 */
function handleExportMonth() {
  mouthExelect(listQuery)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(error.message || '导出失败');
    });
}

/**
 * 导出计划汇总
 */
function handleExportPlan() {
  const params = {
    month: listQuery.month,
    processCode: listQuery.processCode,
    taskLine: listQuery.taskLine,
    partName: listQuery.partName,
    planCode: listQuery.planCode,
    isPartOrProduct: listQuery.isPartOrProduct,
    workShop: 1,
  };
  plotExect(params)
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
function handleDetail(row: any, prop: string) {
  currentField.value = prop;

  if (prop === 'sum') {
    detailQuery.month = listQuery.month;
    detailQuery.day = undefined;
  } else {
    detailQuery.month = prop.slice(0, 7);
    detailQuery.day = prop.slice(8, 10);
  }

  detailQuery.processCode = listQuery.processCode;
  detailQuery.taskLineCode = listQuery.taskLine;
  detailQuery.partName = row.part_name;
  detailQuery.partCode = row.part_code;
  detailQuery.partPlanCode = listQuery.planCode;
  detailQuery.partOrProduct = listQuery.isPartOrProduct;

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
  manList(detailQuery)
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
  tan_pltyExect(detailQuery)
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
  getDefaultMonth();
  getProcessList();
});

// endregion 生命周期
</script>

<template>
  <Page content-class="SMTfulfil">
    <!-- 查询表单 -->
    <Card>
      <Form :model="listQuery" :rules="rules" layout="inline">
        <FormItem label="选择月份" name="month" class="!my-2">
          <DatePicker
            v-model:value="listQuery.month"
            picker="month"
            placeholder="选择月"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 200px"
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
              :key="item.id"
              :value="item.processCode"
            >
              {{ item.processName }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="选择任务线" class="!my-2">
          <Select
            v-model:value="listQuery.lineName"
            allow-clear
            placeholder="请选择"
            class="!w-48"
            @change="handleLineChange"
          >
            <SelectOption
              v-for="item in taskLineList"
              :key="item.id"
              :value="item.lineName"
            >
              {{ item.lineName }}
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
        <FormItem label="部件计划号" class="!my-2">
          <Input
            v-model:value="listQuery.planCode"
            allow-clear
            placeholder="请输入部件计划号"
            class="!w-48"
          />
        </FormItem>
        <FormItem label="部件/产品" class="!my-2">
          <Select
            v-model:value="listQuery.isPartOrProduct"
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

    <!-- 月度汇总表格 -->
    <Card v-show="tableShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">月度汇总</h3>
        <Button type="primary" @click="handleExportMonth">
          <Icon icon="mdi:export" class="mr-1" />
          导出
        </Button>
      </div>
      <MonthGrid />
    </Card>

    <!-- 计划汇总表格 -->
    <Card v-show="tableShow" style="margin-top: 16px">
      <div class="flex items-center justify-between !mb-4">
        <h3 class="text-xl font-bold">计划汇总</h3>
        <Button type="primary" @click="handleExportPlan">
          <Icon icon="mdi:export" class="mr-1" />
          导出
        </Button>
      </div>
      <PlanGrid>
        <template #sum="{ row }">
          <span
            class="cursor-pointer text-blue-500 underline"
            @click="handleDetail(row, 'sum')"
          >
            {{ row.sum }}
          </span>
        </template>
        <template #dayCell="{ row, column }">
          <span
            class="cursor-pointer text-blue-500 underline"
            @click="handleDetail(row, column.field)"
          >
            {{ row[column.field] }}
          </span>
        </template>
      </PlanGrid>
    </Card>

    <!-- 报工明细弹窗 -->
    <Drawer
      v-model:open="detailShow"
      :footer-style="{ textAlign: 'right' }"
      :mask-closable="false"
      title="报工明细"
      width="90%"
    >
      <Button
        type="primary"
        style="margin-bottom: 16px"
        @click="handleExportDetail"
      >
        <Icon icon="mdi:export" class="mr-1" />
        导出
      </Button>
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
    </Drawer>
  </Page>
</template>

<style scoped>
.SMTfulfil :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
