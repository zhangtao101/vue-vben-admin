<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Radio,
  Row,
  Space,
  Switch,
} from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeGridListeners,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import { selectByWorkSheetId, selectWorkSheet, updateStae } from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

// region 查询条件
const queryParams = ref<any>({
  startTime: undefined,
  lineCode: undefined,
  workSheetCode: undefined,
  state: undefined,
});

/** 工单状态单选：undefined全部 1确定 2进行 3完成 */
const statusOptions = [
  { label: $t('mixedWaterProgress.statusAll'), value: undefined },
  { label: $t('mixedWaterProgress.statusConfirmed'), value: 1 },
  { label: $t('mixedWaterProgress.statusInProgress'), value: 2 },
  { label: $t('mixedWaterProgress.statusCompleted'), value: 3 },
];

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = {
    startTime: undefined,
    lineCode: undefined,
    workSheetCode: undefined,
    state: undefined,
  };
  gridApi.reload();
}
// endregion

// region 工单列表（单选，行点击触发，用于加载批次LOT列表）
/** 单选选中的工单 */
const selectedWorkSheet = ref<any>(null);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 320,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'workSheetCode',
      title: $t('mixedWaterProgress.worksheetCode'),
      minWidth: 140,
    },
    {
      field: 'productCode',
      title: $t('mixedWaterProgress.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixedWaterProgress.productName'),
      minWidth: 160,
    },
    {
      field: 'planDateStart',
      title: $t('mixedWaterProgress.planDateStart'),
      minWidth: 110,
    },
    {
      field: 'lineName',
      title: $t('mixedWaterProgress.lineName'),
      minWidth: 110,
    },
    {
      field: 'indicateBatch',
      title: $t('mixedWaterProgress.indicateBatch'),
      minWidth: 100,
    },
    {
      field: 'remainBatch',
      title: $t('mixedWaterProgress.remainBatch'),
      minWidth: 100,
    },
  ],
  proxyConfig: {
    ajax: {
      query: queryWorkSheetList,
    },
  },
};

const gridEvents: VxeGridListeners<any> = {
  radioChange: handleRadioChange,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/** 工单展示：混合水工序 processType 固定为 1 */
async function queryWorkSheetList({ page }: any) {
  try {
    const res = await selectWorkSheet({
      pageNum: page.currentPage,
      pageSize: page.pageSize,
      lineCode: queryParams.value.lineCode,
      startTime: queryParams.value.startTime,
      processType: 1,
      workSheetCode: queryParams.value.workSheetCode,
      state: queryParams.value.state,
    });
    return { total: res.total || 0, items: res.list || [] };
  } catch {
    message.error($t('mixedWaterProgress.workSheetListLoadFailed'));
    return { total: 0, items: [] };
  }
}

/** 行点击单选：选中工单并加载对应批次LOT列表 */
function handleRadioChange({ row }: any) {
  selectedWorkSheet.value = row;
  lotGridApi.reload();
}
// endregion

// region 批次LOT列表（多选，勾选结果用于开始/结束）
/** 多选勾选的批次LOT id 集合（用于开始/结束） */
const selectedLotIds = ref<(number | string)[]>([]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  height: 340,
  stripe: true,
  checkboxConfig: { highlight: true, range: true, trigger: 'row'},
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'lotCode',
      title: $t('mixedWaterProgress.lotCode'),
      minWidth: 100,
    },
    {
      field: 'fullLabel',
      title: $t('mixedWaterProgress.fullLabel'),
      minWidth: 140,
    },
    {
      field: 'looseLabel',
      title: $t('mixedWaterProgress.looseLabel'),
      minWidth: 140,
    },
    {
      field: 'looseUse',
      title: $t('mixedWaterProgress.looseUse'),
      width: 120,
      slots: { default: 'useCell' },
    },
    {
      field: 'fullUse',
      title: $t('mixedWaterProgress.fullUse'),
      width: 120,
      slots: { default: 'useCell' },
    },
  ],
  pagerConfig: { enabled: false },
  toolbarConfig: {
    custom: true,
    refresh: false,
    zoom: true,
  },
  proxyConfig: {
    ajax: {
      query: queryLotList,
    },
  },
};

/** 批次LOT多选勾选变化：收集选中的 LOT id，用于开始/结束按钮 */
function handleLotCheckboxChange() {
  const records = lotGridApi.grid.getCheckboxRecords?.() ?? [];
  selectedLotIds.value = records.map((record: any) => record.id);
}

const lotGridEvents: VxeGridListeners<any> = {
  checkboxChange: handleLotCheckboxChange,
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridEvents: lotGridEvents,
  gridOptions: lotGridOptions,
});

/** 根据单选选中的工单查询批次LOT列表 */
async function queryLotList() {
  if (!selectedWorkSheet.value) {
    return { items: [] };
  }
  try {
    const res = await selectByWorkSheetId(selectedWorkSheet.value.id);
    return { items: Array.isArray(res) ? res : [] };
  } catch {
    message.error($t('mixedWaterProgress.lotListLoadFailed'));
    return { items: [] };
  }
}
// endregion

// region 自动模式 + 开始/结束控制（作用于多选勾选的批次LOT）
const autoMode = ref(false);

/** 开始：对勾选的批次LOT批量开始（自动模式下开始即结束） */
async function handleStart() {
  const records = (lotGridApi.grid.getCheckboxRecords?.() ?? []) as any[];
  if (records.length === 0) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  // 只有 isLoad 为 1（已装载）的批次LOT才能开始
  if (records.some((r) => Number(r.isLoad) !== 1)) {
    message.warning($t('mixedWaterProgress.startOnlyLoaded'));
    return;
  }
  const ids = records.map((r) => r.id);
  try {
    await updateStae(ids, autoMode.value ? 3 : 2);
    message.success($t('mixedWaterProgress.startSuccess'));
    refreshLotList();
  } catch {
    message.error($t('mixedWaterProgress.startFailed'));
  }
}

/** 结束：对勾选的批次LOT批量结束 */
async function handleEnd() {
  const records = (lotGridApi.grid.getCheckboxRecords?.() ?? []) as any[];
  if (records.length === 0) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  // 只有 isTransfer 为 3（已传输）的批次LOT才能结束
  if (records.some((r) => Number(r.isTransfer) !== 3)) {
    message.warning($t('mixedWaterProgress.endOnlyTransferred'));
    return;
  }
  const ids = records.map((r) => r.id);
  try {
    await updateStae(ids, 3);
    message.success($t('mixedWaterProgress.endSuccess'));
    refreshLotList();
  } catch {
    message.error($t('mixedWaterProgress.endFailed'));
  }
}

/** 操作成功后刷新工单列表与批次LOT列表并清空勾选 */
function refreshLotList() {
  gridApi.reload();
  lotGridApi.reload();
  selectedLotIds.value = [];
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 查询条件 -->
    <Card :title="$t('mixedWaterProgress.queryCondition')">
      <Form layout="inline" class="flex flex-wrap gap-2">
        <FormItem :label="$t('mixedWaterProgress.indicateDate')">
          <DatePicker
            v-model:value="queryParams.startTime"
            value-format="YYYY-MM-DD"
            :placeholder="$t('mixedWaterProgress.indicateDatePlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('mixedWaterProgress.lineCode')">
          <Input
            v-model:value="queryParams.lineCode"
            :placeholder="$t('mixedWaterProgress.lineCodePlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('mixedWaterProgress.worksheetCode')">
          <Input
            v-model:value="queryParams.workSheetCode"
            :placeholder="$t('mixedWaterProgress.worksheetPlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('mixedWaterProgress.indicateStatus')">
          <Radio.Group v-model:value="queryParams.state">
            <Radio
              v-for="item in statusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Radio>
          </Radio.Group>
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
    </Card>

    <!-- 工单列表 -->
    <Card :title="$t('mixedWaterProgress.worksheetList')">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>

    <!-- 批次LOT列表 -->
    <Card :title="$t('mixedWaterProgress.lotList')">
      <LotGrid>
        <template #toolbar-tools></template>
        <template #useCell="{ row, column }">
          <Checkbox :checked="Number(row[column.field]) === 1" disabled />
        </template>
      </LotGrid>

      <!-- 自动模式开关 + 开始/结束按钮（作用于多选勾选的工单） -->
      <Row class="mt-3 flex items-center" :gutter="16">
        <Col flex="auto" class="flex items-center gap-2">
          <span class="text-sm font-medium">
            {{ $t('mixedWaterProgress.autoMode') }}
          </span>
          <Switch v-model:checked="autoMode" />
        </Col>
        <Col flex="none">
          <Space>
            <Button
              type="primary"
              :disabled="selectedLotIds.length === 0"
              @click="handleStart"
            >
              {{ $t('mixedWaterProgress.start') }}
            </Button>
            <Button
              :disabled="selectedLotIds.length === 0"
              @click="handleEnd"
            >
              {{ $t('mixedWaterProgress.end') }}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  </div>
</template>
