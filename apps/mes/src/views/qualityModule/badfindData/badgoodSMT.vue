<script lang="ts" setup>
/**
 * SMT车间产品不良页面
 * 用于查看SMT车间产品不良一览月汇总、SMT车间月产品不良明细以及缺陷不良明细
 * 功能包括：条件查询、月度汇总查询、不良明细查询、缺陷不良明细弹窗、导出数据
 * @since 2026-10-10
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

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
  message,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exportDefectDaySummary,
  exportDefectDetailList,
  exportDefectMonthSummary,
  queryDefectDaySummary,
  queryDefectDetailList,
  queryDefectMonthSummary,
  queryDiscoveryProcess,
  queryLineByWorkshop,
} from '#/api';

// region 常量定义

// 明细表格中固定展示的字段（生产计划号/工单编号/产品/部件）
const FIXED_FIELDS = new Set([
  'plan_code',
  'product_code',
  'product_name',
  'sub_product_code',
  'sub_product_name',
  'worksheet_code',
]);
// 明细表格中固定字段的列宽
const FIXED_WIDTHS: Record<string, number> = {
  plan_code: 95,
  product_code: 75,
  product_name: 130,
  sub_product_code: 75,
  sub_product_name: 130,
  worksheet_code: 95,
};

// endregion 常量定义

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
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
};

const [MonthGrid, monthGridApi] = useVbenVxeGrid({
  gridOptions: monthGridOptions,
});

// endregion 月度汇总表格配置

// region 不良明细表格配置

/**
 * 不良明细表格配置
 * 动态列，根据月份天数生成
 */
const dayColumns = ref<any[]>([]);
const dayGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: dayColumns.value,
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await handleDayQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
};

const [DayGrid, dayGridApi] = useVbenVxeGrid({ gridOptions: dayGridOptions });

// endregion 不良明细表格配置

// region 缺陷不良明细表格配置

/**
 * 缺陷不良明细表格配置
 */
const detailColumns: any[] = [
  { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
  {
    field: 'defectCode',
    title: $t('qualityModule.badfindData.defectCode'),
    minWidth: 100,
  },
  {
    field: 'defectName',
    title: $t('qualityModule.badfindData.defectName'),
    minWidth: 80,
  },
  {
    field: 'defectNumber',
    title: $t('qualityModule.badfindData.defectNumber'),
    minWidth: 80,
  },
  {
    field: 'location',
    title: $t('qualityModule.badfindData.location'),
    minWidth: 120,
  },
  {
    field: 'discoveryDefectId',
    title: $t('qualityModule.badfindData.discoveryDefectId'),
    minWidth: 120,
  },
  {
    field: 'defectProductNumber',
    title: $t('qualityModule.badfindData.defectProductNumber'),
    minWidth: 100,
  },
  {
    field: 'discoveryProcessName',
    title: $t('qualityModule.badfindData.discoveryProcessName'),
    minWidth: 100,
  },
  {
    field: 'operateTime',
    title: $t('qualityModule.badfindData.operateTime'),
    minWidth: 110,
  },
  {
    field: 'operateUserName',
    title: $t('qualityModule.badfindData.operateUserName'),
    minWidth: 120,
  },
  {
    field: 'equipmentName',
    title: $t('qualityModule.badfindData.equipmentName'),
    minWidth: 80,
  },
  {
    field: 'worksheetCode',
    title: $t('qualityModule.badfindData.worksheetCode'),
    minWidth: 150,
  },
  {
    field: 'lineName',
    title: $t('qualityModule.badfindData.lineName'),
    minWidth: 150,
  },
  {
    field: 'subProductName',
    title: $t('qualityModule.badfindData.subProductName'),
    minWidth: 150,
  },
  {
    field: 'subProductCode',
    title: $t('qualityModule.badfindData.subProductCode'),
    minWidth: 150,
  },
  {
    field: 'subPlanCode',
    title: $t('qualityModule.badfindData.subPlanCode'),
    minWidth: 150,
  },
  {
    field: 'productName',
    title: $t('qualityModule.badfindData.productName'),
    minWidth: 150,
  },
  {
    field: 'productCode',
    title: $t('qualityModule.badfindData.productCode'),
    minWidth: 150,
  },
  {
    field: 'planCode',
    title: $t('qualityModule.badfindData.planCode'),
    minWidth: 150,
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
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

// endregion 缺陷不良明细表格配置

// region 状态定义

// 缺陷不良明细弹窗是否显示
const detailShow = ref(false);

// 查询表单
const searchForm = ref();

// 查询参数
const listQuery = reactive<any>({
  pageNum: 1,
  pageSize: 10,
  month: undefined as string | undefined,
  workshop: 1,
  productCode: undefined as string | undefined,
  subProductCode: undefined as string | undefined,
  worksheetCode: undefined as string | undefined,
  lineId: undefined as number | undefined,
  productName: undefined as string | undefined,
  subProductName: undefined as string | undefined,
  planCode: undefined as string | undefined,
  discoveryProcessCode: undefined as string | undefined,
});

// 缺陷不良明细查询参数
const detailQuery = reactive<any>({
  month: undefined as string | undefined,
  day: undefined as string | undefined,
  workshop: 1,
  planCode: undefined as string | undefined,
  worksheetCode: undefined as string | undefined,
  productCode: undefined as string | undefined,
  productName: undefined as string | undefined,
  subProductCode: undefined as string | undefined,
  subProductName: undefined as string | undefined,
  lineId: undefined as number | undefined,
  discoveryProcessCode: undefined as string | undefined,
});

// 生产线下拉选项
const lineOptions = ref<any[]>([]);
// 发现工序下拉选项
const discoveryProcessOptions = ref<any[]>([]);

// 表单验证规则
const rules: any = {
  month: [
    {
      required: true,
      message: $t('qualityModule.badfindData.pleaseSelectMonth'),
      trigger: 'change',
    },
  ],
};

// endregion 状态定义

// region 方法定义

/**
 * 获取默认月份（当前月）
 * @since 2026-10-10
 */
function getDefaultMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  listQuery.month = `${y}-${m}`;
}

/**
 * 查询生产线下拉
 * @since 2026-10-10
 */
function queryLineList() {
  queryLineByWorkshop({ workshop: 1 })
    .then((data: any) => {
      lineOptions.value = (data || []).map((item: any) => ({
        label: item.lineName,
        value: item.id,
      }));
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailure'));
    });
}

/**
 * 查询发现工序下拉
 * @since 2026-10-10
 */
function queryDiscoveryProcessList() {
  queryDiscoveryProcess({})
    .then((data: any) => {
      discoveryProcessOptions.value = (data || []).map((item: any) => ({
        label: item.processName,
        value: item.processCode,
      }));
    })
    .catch((error: any) => {
      message.error(error.message || $t('common.operationFailure'));
    });
}

/**
 * 构建月度汇总动态列
 * 合计列展示原始标题，其余列展示日期（日）
 * @param {any[]} column 接口返回的列定义
 * @returns {any[]} 表格列配置
 * @since 2026-10-10
 */
function buildMonthColumns(column: any[]) {
  return (column || []).map((col: any) =>
    col.prop === 'sum'
      ? { field: col.prop, minWidth: 80, title: col.label }
      : { field: col.prop, minWidth: 80, title: `${col.label}`.slice(8, 10) },
  );
}

/**
 * 查询月度汇总
 * @since 2026-10-10
 */
function loadMonthData() {
  queryDefectMonthSummary(listQuery)
    .then((data: any) => {
      const cols = buildMonthColumns(data?.column);
      monthColumns.value = cols;
      monthGridApi.grid.loadColumn(cols);
      // 月度汇总只有一行数据（汇总行）
      monthGridApi.grid.reloadData(data?.result ? [data.result] : []);
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('qualityModule.badfindData.loadMonthDataFailed'),
      );
    });
}

/**
 * 构建不良明细动态列
 * 固定字段左固定展示，合计与日期列可点击查看缺陷不良明细
 * @param {any[]} column 接口返回的列定义
 * @returns {any[]} 表格列配置
 * @since 2026-10-10
 */
function buildDayColumns(column: any[]) {
  const cols: any[] = [];
  (column || []).forEach((col: any) => {
    if (col.prop === 'sum') {
      cols.push({
        field: col.prop,
        fixed: 'left',
        minWidth: 80,
        slots: { default: 'sum' },
        title: col.label,
      });
    } else if (FIXED_FIELDS.has(col.prop)) {
      cols.push({
        field: col.prop,
        fixed: 'left',
        minWidth: FIXED_WIDTHS[col.prop],
        title: col.label,
      });
    } else {
      cols.push({
        field: col.prop,
        minWidth: 80,
        slots: { default: 'dayCell' },
        title: `${col.label}`.slice(8, 10),
      });
    }
  });
  return cols;
}

/**
 * 查询不良明细
 * @param {number} page 页码
 * @param {number} pageSize 每页条数
 * @returns {Promise} 包含总条数和数据列表的 Promise
 * @since 2026-10-10
 */
function handleDayQuery({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...listQuery,
      pageNum: page,
      pageSize,
    };
    queryDefectDaySummary(params)
      .then(({ total, result, column }: any) => {
        const cols = buildDayColumns(column);
        dayColumns.value = cols;
        dayGridApi.grid.loadColumn(cols);
        resolve({
          total,
          items: result,
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

/**
 * 查询
 * @since 2026-10-10
 */
function handleSearch() {
  searchForm.value
    .validate()
    .then(() => {
      loadMonthData();
      dayGridApi.reload();
    })
    .catch(() => {
      // 校验不通过，不执行查询
    });
}

/**
 * 导出月度汇总
 * @since 2026-10-10
 */
function handleExportMonth() {
  searchForm.value
    .validate()
    .then(() => {
      exportDefectMonthSummary(listQuery)
        .then((url: any) => {
          window.open(url);
        })
        .catch((error: any) => {
          message.error(
            error.message || $t('qualityModule.badfindData.exportFailed'),
          );
        });
    })
    .catch(() => {
      // 校验不通过，不执行导出
    });
}

/**
 * 导出不良明细
 * @since 2026-10-10
 */
function handleExportDay() {
  searchForm.value
    .validate()
    .then(() => {
      const params = {
        month: listQuery.month,
        planCode: listQuery.planCode,
        productCode: listQuery.productCode,
        productName: listQuery.productName,
        subProductCode: listQuery.subProductCode,
        subProductName: listQuery.subProductName,
        worksheetCode: listQuery.worksheetCode,
        lineId: listQuery.lineId,
        discoveryProcessCode: listQuery.discoveryProcessCode,
        workshop: 1,
      };
      exportDefectDaySummary(params)
        .then((url: any) => {
          window.open(url);
        })
        .catch((error: any) => {
          message.error(
            error.message || $t('qualityModule.badfindData.exportFailed'),
          );
        });
    })
    .catch(() => {
      // 校验不通过，不执行导出
    });
}

/**
 * 查看缺陷不良明细
 * @param {any} row 当前明细行
 * @param {string} prop 点击的字段（合计或日期列）
 * @returns {void} 无返回值，打开弹窗并加载明细
 * @since 2026-10-10
 */
function handleDetail(row: any, prop: string) {
  // 点击合计时按整月查询，点击日期列时按具体日期查询
  detailQuery.month = prop === 'sum' ? listQuery.month : prop.slice(0, 7);
  detailQuery.day = prop === 'sum' ? undefined : prop.slice(8, 10);
  detailQuery.planCode = row.plan_code;
  detailQuery.worksheetCode = row.worksheet_code;
  detailQuery.productCode = row.product_code;
  detailQuery.productName = row.product_name;
  detailQuery.subProductCode = row.sub_product_code;
  detailQuery.subProductName = row.sub_product_name;
  detailQuery.lineId = listQuery.lineId;
  detailQuery.discoveryProcessCode = listQuery.discoveryProcessCode;
  detailShow.value = true;
  loadDetailData();
}

/**
 * 加载缺陷不良明细数据
 * @since 2026-10-10
 */
function loadDetailData() {
  queryDefectDetailList(detailQuery)
    .then((data: any) => {
      detailGridApi.grid.reloadData(data?.results || []);
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('qualityModule.badfindData.loadDetailDataFailed'),
      );
    });
}

/**
 * 导出缺陷不良明细
 * @since 2026-10-10
 */
function handleExportDetail() {
  exportDefectDetailList(detailQuery)
    .then((url: any) => {
      window.open(url);
    })
    .catch((error: any) => {
      message.error(
        error.message || $t('qualityModule.badfindData.exportFailed'),
      );
    });
}

/**
 * 关闭缺陷不良明细弹窗
 * @since 2026-10-10
 */
function handleDetailClose() {
  detailShow.value = false;
  detailGridApi.grid.reloadData([]);
}

// endregion 方法定义

// region 生命周期

onMounted(() => {
  getDefaultMonth();
  queryLineList();
  queryDiscoveryProcessList();
  loadMonthData();
  dayGridApi.reload();
});

// endregion 生命周期
</script>

<template>
  <Page content-class="badgoodSMT">
    <!-- region 查询表单 -->
    <Card>
      <Form ref="searchForm" :model="listQuery" :rules="rules" layout="inline">
        <!-- 选择月份 -->
        <FormItem
          :label="$t('qualityModule.badfindData.selectMonth')"
          name="month"
          class="!my-2"
        >
          <DatePicker
            v-model:value="listQuery.month"
            :placeholder="$t('qualityModule.badfindData.selectMonth')"
            format="YYYY-MM"
            picker="month"
            style="width: 200px"
            value-format="YYYY-MM"
          />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('qualityModule.badfindData.productCode')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.productCode"
            :placeholder="$t('qualityModule.badfindData.productCode')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 部件编号 -->
        <FormItem
          :label="$t('qualityModule.badfindData.subProductCode')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.subProductCode"
            :placeholder="$t('qualityModule.badfindData.subProductCode')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 工单编号 -->
        <FormItem
          :label="$t('qualityModule.badfindData.worksheetCode')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.worksheetCode"
            :placeholder="$t('qualityModule.badfindData.worksheetCode')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 生产线 -->
        <FormItem :label="$t('qualityModule.badfindData.line')" class="!my-2">
          <Select
            v-model:value="listQuery.lineId"
            :placeholder="$t('qualityModule.badfindData.pleaseSelect')"
            allow-clear
            class="!w-48"
          >
            <SelectOption
              v-for="item in lineOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('qualityModule.badfindData.productName')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.productName"
            :placeholder="$t('qualityModule.badfindData.productName')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 部件名称 -->
        <FormItem
          :label="$t('qualityModule.badfindData.subProductName')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.subProductName"
            :placeholder="$t('qualityModule.badfindData.subProductName')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 生产计划编号 -->
        <FormItem
          :label="$t('qualityModule.badfindData.planCode')"
          class="!my-2"
        >
          <Input
            v-model:value="listQuery.planCode"
            :placeholder="$t('qualityModule.badfindData.planCode')"
            allow-clear
            class="!w-48"
          />
        </FormItem>
        <!-- 发现工序 -->
        <FormItem
          :label="$t('qualityModule.badfindData.discoveryProcess')"
          class="!my-2"
        >
          <Select
            v-model:value="listQuery.discoveryProcessCode"
            :placeholder="$t('qualityModule.badfindData.pleaseSelect')"
            allow-clear
            class="!w-48"
          >
            <SelectOption
              v-for="item in discoveryProcessOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem class="!my-2">
          <Space>
            <Button type="primary" @click="handleSearch">
              <Icon icon="mdi:search" class="mr-1" />
              {{ $t('common.search') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 月度汇总 -->
    <Card style="margin-top: 16px">
      <h3 class="text-xl font-bold !mb-4">
        {{ $t('qualityModule.badfindData.monthSummary') }}
      </h3>
      <MonthGrid>
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" class="mr-4!" @click="handleExportMonth">
            <Icon icon="mdi:export" class="mr-1" />
            {{ $t('common.export') }}
          </Button>
        </template>
      </MonthGrid>
    </Card>
    <!-- endregion -->

    <!-- region 月产品不良明细 -->
    <Card style="margin-top: 16px">
      <h3 class="text-xl font-bold !mb-4">
        {{ $t('qualityModule.badfindData.dayDetail') }}
      </h3>
      <DayGrid>
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" class="mr-4!" @click="handleExportDay">
            <Icon icon="mdi:export" class="mr-1" />
            {{ $t('common.export') }}
          </Button>
        </template>
        <!-- 合计列 -->
        <template #sum="{ row }">
          <span
            class="cursor-pointer text-blue-500 underline"
            @click="handleDetail(row, 'sum')"
          >
            {{ row.sum }}
          </span>
        </template>
        <!-- 日期列 -->
        <template #dayCell="{ row, column }">
          <span
            class="cursor-pointer text-blue-500 underline"
            @click="handleDetail(row, column.field)"
          >
            {{ row[column.field] }}
          </span>
        </template>
      </DayGrid>
    </Card>
    <!-- endregion -->

    <!-- region 缺陷不良明细弹窗 -->
    <Drawer
      v-model:open="detailShow"
      :title="$t('qualityModule.badfindData.defectDetail')"
      width="90%"
      @close="handleDetailClose"
    >
      <DetailGrid>
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" class="mr-4!" @click="handleExportDetail">
            <Icon icon="mdi:export" class="mr-1" />
            {{ $t('common.export') }}
          </Button>
        </template>
      </DetailGrid>
    </Drawer>
    <!-- endregion -->
  </Page>
</template>

<style scoped>
.badgoodSMT :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
