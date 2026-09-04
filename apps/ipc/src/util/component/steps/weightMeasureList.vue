<script setup lang="ts">
/**
 * [INPUT]: 依赖 vxe-table 适配器（VxeGridProps/useVbenVxeGrid）、#/api 的 queryMeasureRecordList 接口、#/locales 国际化与 ant-design-vue 组件。
 * [OUTPUT]: 对外提供 WeightMeasureList 重量测量列表步骤组件（步骤组件标准入参 functionId/workstationCode/processCode）。
 * [POS]: 属于包装工序步骤组件，页面由查询条件区与测量记录表格组成，有且仅有查询功能。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-09-04 00:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  RangePicker,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryMeasureRecordList, searchSubLineByProcessCode } from '#/api';
import { $t } from '#/locales';

import WorkSheetSelectDrawer from '../drawers/WorkSheetSelectDrawer.vue';

defineOptions({
  name: 'WeightMeasureList',
});

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
  /** 子产线编码：用于子产线下拉初始选中（如包装页指标数抽屉传入 form.lineCode） */
  lineCode: { type: String, default: '' },
});

// ========== 查询条件 ==========
const queryParams = reactive<any>({
  // 测量时间范围 [startTime, endTime]
  dateRange: [],
  workSheetCode: '',
  produceLine: undefined,
  weight: undefined,
});

/** 子产线下拉选项（label 展示 编码(名称)，value 为子产线编码，id 供工单选择抽屉使用） */
const lineOptions = ref<{ id: any; label: string; value: string }[]>([]);
/** 当前选中子产线的 id（用于打开工单选择抽屉） */
const lineIdRef = ref<any>('');

/**
 * 加载子产线下拉选项：根据工序编码获取子产线列表
 * @returns 无返回值，加载完成后回填 lineOptions
 * @throws 接口失败时由统一错误处理层提示，此处不额外捕获
 * @since 2026-09-04
 */
function loadLineOptions() {
  if (!props.processCode) {
    lineOptions.value = [];
    return;
  }
  return searchSubLineByProcessCode(props.processCode).then((res: any) => {
    lineOptions.value = (res ?? []).map((item: any) => ({
      id: item.id,
      label: `${item.subLineCode}(${item.subLineName})`,
      value: item.subLineCode,
    }));
    // 外部传入子产线编码（如包装页指标数抽屉）且存在于下拉选项中时，作为初始选中
    const matched = lineOptions.value.find(
      (item) => item.value === props.lineCode,
    );
    queryParams.produceLine = matched ? props.lineCode : undefined;
    lineIdRef.value = matched?.id ?? '';
    gridApi.reload();
  });
}

// ========== 测量记录表格 ==========
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: $t('weightMeasureList.colIndex') },
    {
      field: 'worksheetCode',
      title: $t('weightMeasureList.colWorkSheetCode'),
      minWidth: 150,
    },
    {
      field: 'lineCode',
      title: $t('weightMeasureList.colLineCode'),
      minWidth: 120,
    },
    {
      field: 'lineName',
      title: $t('weightMeasureList.colLineName'),
      minWidth: 160,
    },
    {
      field: 'productName',
      title: $t('weightMeasureList.colProductName'),
      minWidth: 200,
    },
    {
      field: 'measureValue',
      title: $t('weightMeasureList.colMeasureValue'),
      minWidth: 120,
      slots: { default: 'measureValue' },
    },
    {
      field: 'measureTime',
      title: $t('weightMeasureList.colMeasureTime'),
      minWidth: 170,
    },
    {
      field: 'handleDate',
      title: $t('weightMeasureList.colHandleDate'),
      minWidth: 130,
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: queryMeasureData,
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 查询测量记录列表：将查询条件映射为接口参数并分页返回
 * @param page 分页信息
 * @param page.currentPage 当前页码
 * @param page.pageSize 每页条数
 * @returns 分页记录（items 记录数组、total 总数）
 * @since 2026-09-04
 */
function queryMeasureData({ page }: any) {
  const params: any = {
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  if (queryParams.dateRange?.length === 2) {
    params.startTime = queryParams.dateRange[0].format('YYYY-MM-DD');
    params.endTime = queryParams.dateRange[1].format('YYYY-MM-DD');
  }
  if (queryParams.workSheetCode) {
    params.workSheetCode = queryParams.workSheetCode;
  }
  if (queryParams.produceLine) {
    params.produceLine = queryParams.produceLine;
  }
  if (queryParams.weight !== undefined && queryParams.weight !== null) {
    params.weight = queryParams.weight;
  }
  return queryMeasureRecordList(params).then((res: any) => ({
    items: res?.results ?? [],
    total: res?.total ?? 0,
  }));
}

/**
 * 触发查询：重新加载测量记录表格
 * @returns 无返回值
 * @since 2026-09-04
 */
function handleQuery() {
  gridApi.reload();
}

/**
 * 重置查询条件并重新加载测量记录表格
 * @returns 无返回值
 * @since 2026-09-04
 */
function handleReset() {
  queryParams.dateRange = [];
  queryParams.workSheetCode = '';
  queryParams.produceLine = undefined;
  queryParams.weight = undefined;
  lineIdRef.value = '';
  gridApi.reload();
}

/**
 * 子产线下拉切换：记录选中项 id 供工单选择抽屉使用，清空时联动清空已选工单
 * @param _value 选中值（子产线编码，未直接使用）
 * @param item 选中项（含 id）
 * @returns 无返回值
 * @since 2026-09-04
 */
function handleLineChange(_value: any, item: any) {
  lineIdRef.value = item?.id ?? '';
  if (!item) {
    queryParams.workSheetCode = '';
  }
}

/** 工单选择抽屉实例 */
const workSheetDrawerRef = ref<any>();

/**
 * 打开工单选择抽屉：未选择子产线时给出提示
 * @returns 无返回值
 * @since 2026-09-04
 */
function handleSelectWorkSheet() {
  if (!lineIdRef.value) {
    message.warning($t('weightMeasureList.plsSelectLine'));
    return;
  }
  workSheetDrawerRef.value?.open(lineIdRef.value);
}

/**
 * 选中工单后回填查询条件并刷新测量记录列表
 * @param row 工单行数据
 * @returns 无返回值
 * @since 2026-09-04
 */
function handleWorkSheetSelected(row: any) {
  queryParams.workSheetCode = row?.workSheetCode ?? '';
  gridApi.reload();
}

onMounted(() => {
  loadLineOptions();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 1. 页面标题 -->
    <div class="text-lg font-bold">{{ $t('weightMeasureList.title') }}</div>

    <!-- 2. 查询区域 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form
        :model="queryParams"
        layout="inline"
        class="flex-wrap items-end gap-2"
      >
        <FormItem :label="$t('weightMeasureList.dateRange')">
          <RangePicker
            v-model:value="queryParams.dateRange"
            :placeholder="[
              $t('weightMeasureList.dateStart'),
              $t('weightMeasureList.dateEnd'),
            ]"
          />
        </FormItem>
        <FormItem :label="$t('weightMeasureList.workSheetCode')">
          <div class="flex items-center gap-2">
            <Input
              v-model:value="queryParams.workSheetCode"
              :placeholder="$t('weightMeasureList.workSheetCodePlaceholder')"
              disabled
              class="w-44"
            />
            <Button @click="handleSelectWorkSheet">
              {{ $t('weightMeasureList.select') }}
            </Button>
          </div>
        </FormItem>
        <FormItem :label="$t('weightMeasureList.produceLine')">
          <Select
            v-model:value="queryParams.produceLine"
            :options="lineOptions"
            :placeholder="$t('weightMeasureList.produceLinePlaceholder')"
            allow-clear
            class="w-72!"
            @change="handleLineChange"
          />
        </FormItem>
        <FormItem :label="$t('weightMeasureList.weight')">
          <InputNumber
            v-model:value="queryParams.weight"
            :placeholder="$t('weightMeasureList.weightPlaceholder')"
            class="w-40"
            @press-enter="handleQuery"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </div>

    <!-- 3. 测量记录表格 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">
        {{ $t('weightMeasureList.recordList') }}
      </div>
      <Grid>
        <!-- 使用 VxeTable 时必须保留的空插槽 -->
        <template #toolbar-tools></template>
        <!-- 测量值（携带单位） -->
        <template #measureValue="{ row }">
          <span>
            {{ row?.measureValue ?? '-' }}{{ row?.unit ? ` ${row.unit}` : '' }}
          </span>
        </template>
      </Grid>
    </div>

    <!-- 工单选择抽屉：选择后回填工单号查询条件 -->
    <WorkSheetSelectDrawer
      ref="workSheetDrawerRef"
      @select="handleWorkSheetSelected"
    />
  </div>
</template>
