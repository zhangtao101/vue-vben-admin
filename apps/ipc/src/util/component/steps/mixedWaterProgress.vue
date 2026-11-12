<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

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
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  autoStartWorkSheet,
  getProcessCode,
  selectByWorkSheetId,
  selectWorkSheet,
  updateStae,
} from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 查询条件
/** 指示日期默认值：当前日期（yyyy-MM-dd） */
const DEFAULT_PLAN_DATE = () => dayjs().format('YYYY-MM-DD');

const queryParams = ref<any>({
  startTime: DEFAULT_PLAN_DATE(),
  lineName: undefined,
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
    startTime: DEFAULT_PLAN_DATE(),
    lineName: undefined,
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
  rowClassName: 'ipc-grid-row',
  headerRowClassName: 'ipc-grid-header-row',
  align: 'center',
  border: true,
  height: 400,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
  toolbarConfig: { custom: false, refresh: false, zoom: false },
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'planDateStart',
      title: $t('mixedWaterProgress.planDateStart'),
      minWidth: 110,
    },
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

/** 混合水工序：工单查询与状态更新均固定 processType 为 1 */
const PROCESS_TYPE = 1;

/** 工单展示：混合水工序 processType 固定为 1 */
function queryWorkSheetList({ page }: any) {
  return selectWorkSheet({
    pageNum: page.currentPage,
    pageSize: page.pageSize,
    lineName: queryParams.value.lineName,
    startTime: queryParams.value.startTime,
    processType: PROCESS_TYPE,
    workSheetCode: queryParams.value.workSheetCode,
    state: queryParams.value.state,
  })
    .then((res: any) => ({ total: res.total || 0, items: res.list || [] }))
    .catch(() => {
      message.error($t('mixedWaterProgress.workSheetListLoadFailed'));
      return { total: 0, items: [] };
    });
}

/** 行点击单选：选中工单并加载对应批次LOT列表 */
function handleRadioChange({ row }: any) {
  selectedWorkSheet.value = row;
  selectedLotIds.value = [];
  lotGridApi.reload();
}
// endregion

// region 批次LOT列表（单选，选中结果用于开始/结束）
/** 单选选中的批次LOT id 集合（用于开始/结束） */
const selectedLotIds = ref<(number | string)[]>([]);

const lotGridOptions: VxeGridProps<any> = {
  rowClassName: 'ipc-grid-row',
  headerRowClassName: 'ipc-grid-header-row',
  align: 'center',
  border: true,
  height: 280,
  stripe: true,
  radioConfig: { highlight: true, trigger: 'row' },
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'startTime',
      title: $t('mixedWaterProgress.startTime'),
      minWidth: 160,
    },
    {
      field: 'endTime',
      title: $t('mixedWaterProgress.endTime'),
      minWidth: 160,
    },
    {
      field: 'lotCode',
      title: $t('mixedWaterProgress.lotCode'),
      minWidth: 100,
    },
    {
      field: 'fullLabel',
      title: $t('mixedWaterProgress.palletNo'),
      minWidth: 140,
    },
    {
      field: 'batch',
      title: $t('mixedWaterProgress.batchCount'),
      minWidth: 90,
    },
    {
      field: 'isLoad',
      title: $t('mixedWaterProgress.materialLoaded'),
      width: 120,
      slots: { default: 'useCell' },
    },
    {
      field: 'state',
      title: $t('mixedWaterProgress.batchStarted'),
      width: 120,
      slots: { default: 'stateCell' },
      params: { target: 2 },
    },
    {
      field: 'state',
      title: $t('mixedWaterProgress.batchEnded'),
      width: 120,
      slots: { default: 'stateCell' },
      params: { target: 3 },
    },
    // {
    //   field: 'looseLabel',
    //   title: $t('mixedWaterProgress.looseLabel'),
    //   minWidth: 140,
    // },
    // {
    //   field: 'looseUse',
    //   title: $t('mixedWaterProgress.looseUse'),
    //   width: 120,
    //   slots: { default: 'useCell' },
    // },
    // {
    //   field: 'fullUse',
    //   title: $t('mixedWaterProgress.isInput'),
    //   width: 120,
    //   slots: { default: 'useCell' },
    // },
  ],
  pagerConfig: { enabled: false },
  toolbarConfig: { custom: false, refresh: false, zoom: false },
  proxyConfig: {
    ajax: {
      query: queryLotList,
    },
  },
};

/** 批次LOT单选变化：记录选中的 LOT id，用于开始/结束按钮 */
function handleLotRadioChange({ row }: any) {
  selectedLotIds.value = row ? [row.id] : [];
}

const lotGridEvents: VxeGridListeners<any> = {
  radioChange: handleLotRadioChange,
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridEvents: lotGridEvents,
  gridOptions: lotGridOptions,
});

/** 根据单选选中的工单查询批次LOT列表 */
function queryLotList() {
  if (!selectedWorkSheet.value) {
    return Promise.resolve({ items: [] });
  }
  return selectByWorkSheetId(selectedWorkSheet.value.id)
    .then((res: any) => ({ items: Array.isArray(res) ? res : [] }))
    .catch(() => {
      message.error($t('mixedWaterProgress.lotListLoadFailed'));
      return { items: [] };
    });
}
// endregion

// region 自动模式（作用于单选选中的工单） + 开始/结束控制（作用于单选选中的批次LOT）
const autoMode = ref(false);

/**
 * 加载当前工序状态：页面加载时调用 getProcessCode，返回 1 时自动模式默认选中
 * @returns {Promise<void>} 无返回值，接口失败时保持默认关闭。
 * @throws 不主动抛出异常。
 * @since 2026-11-05 00:00:00
 */
function loadProcessState() {
  getProcessCode(PROCESS_TYPE)
    .then((res: any) => {
      autoMode.value = String(res) === '1';
    })
    .catch(() => {
      autoMode.value = false;
    });
}

/** 获取当前单选的批次LOT行 */
function getSelectedLot(): any {
  return lotGridApi.grid?.getRadioRecord?.() ?? null;
}

/** 开始：对选中的批次LOT开始（ workState 为 2 已开始、3 已结束的批次不能开始） */
function handleStart() {
  const record = getSelectedLot();
  if (!record) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  const workState = Number(record.workState);
  if (workState === 2) {
    message.warning($t('mixedWaterProgress.alreadyStarted'));
    return;
  }
  if (workState === 3) {
    message.warning($t('mixedWaterProgress.alreadyEnded'));
    return;
  }
  updateStae([record.id], 2, PROCESS_TYPE)
    .then(() => {
      message.success($t('mixedWaterProgress.startSuccess'));
      refreshLotList();
    })
    .catch(() => {
      message.error($t('mixedWaterProgress.startFailed'));
    });
}

/** 结束：对选中的批次LOT结束 */
function handleEnd() {
  const record = getSelectedLot();
  if (!record) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  // 只有 workState 为 2（作业中）的批次LOT才能结束
  if (Number(record.workState) !== 2) {
    message.warning($t('mixedWaterProgress.endOnlyWorking'));
    return;
  }
  updateStae([record.id], 3, PROCESS_TYPE)
    .then(() => {
      message.success($t('mixedWaterProgress.endSuccess'));
      refreshLotList();
    })
    .catch(() => {
      message.error($t('mixedWaterProgress.endFailed'));
    });
}

/** 自动模式开关：开启下发状态 1，关闭下发状态 0 */
function handleAutoModeChange(checked: boolean) {
  // const ws = selectedWorkSheet.value;
  // if (!ws?.id) {
  //   message.warning($t('mixedWaterProgress.plsSelectWorkSheetForAuto'));
  //   autoMode.value = false;
  //   return;
  // }

  // id: ws.id,
  autoStartWorkSheet({
    state: checked ? 1 : 0,
    processType: PROCESS_TYPE,
    equipCode: '',
  })
    .then(() => {
      message.success(
        checked
          ? $t('mixedWaterProgress.startSuccess')
          : $t('mixedWaterProgress.autoModeCloseSuccess'),
      );
      refreshLotList();
      // 下发成功后重新查询工序状态，确认自动模式当前实际状态
      loadProcessState();
    })
    .catch(() => {
      // message.error($t('mixedWaterProgress.startFailed'));
      autoMode.value = !checked;
    });
}

/** 操作成功后刷新工单列表与批次LOT列表并清空勾选 */
function refreshLotList() {
  gridApi.reload();
  lotGridApi.reload();
  selectedLotIds.value = [];
}
// endregion

onMounted(() => {
  // 获取当前工序状态，返回 1 时自动模式默认选中
  loadProcessState();
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 查询条件 -->
    <Card :body-style="{ padding: '4px' }">
      <Form layout="inline" class="flex flex-wrap gap-2">
        <FormItem :label="$t('mixedWaterProgress.indicateDate')">
          <DatePicker
            v-model:value="queryParams.startTime"
            value-format="YYYY-MM-DD"
            :placeholder="$t('mixedWaterProgress.indicateDatePlaceholder')"
            allow-clear
          />
        </FormItem>
        <FormItem :label="$t('mixedWaterProgress.lineName')">
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="$t('mixedWaterProgress.lineNamePlaceholder')"
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
    <Card :body-style="{ padding: '4px' }">
      <Grid>
        <!-- <template #toolbar-tools></template> -->
      </Grid>
    </Card>

    <!-- 批次LOT列表 -->
    <Card :body-style="{ padding: '4px' }">
      <LotGrid>
        <!-- <template #toolbar-tools></template> -->
        <template #useCell="{ row, column }">
          <Checkbox :checked="Number(row[column.field]) === 1" disabled />
        </template>
        <!-- 按列参数指定的状态值勾选：2 已开始、3 已结束 -->
        <template #stateCell="{ row, column }">
          <Checkbox
            :checked="Number(row.state) === Number(column.params?.target)"
            disabled
          />
        </template>
      </LotGrid>

      <!-- 自动模式开关 + 开始/结束按钮（作用于多选勾选的工单） -->
      <Row class="mt-3 flex items-center" :gutter="16">
        <Col flex="auto" class="flex items-center gap-2">
          <span class="ipc-fs-sm font-medium">
            {{ $t('mixedWaterProgress.autoMode') }}
          </span>
          <Switch
            v-model:checked="autoMode"
            @change="(checked: any) => handleAutoModeChange(checked)"
          />
        </Col>
        <Col flex="none">
          <Space>
            <Button
              type="primary"
              :disabled="selectedLotIds.length === 0 || autoMode"
              @click="handleStart"
            >
              {{ $t('mixedWaterProgress.start') }}
            </Button>
            <Button
              :disabled="selectedLotIds.length === 0 || autoMode"
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
