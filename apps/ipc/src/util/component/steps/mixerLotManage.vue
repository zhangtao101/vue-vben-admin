<script setup lang="ts">
import { ref, watch } from 'vue';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  addBatch,
  addCreate,
  addLot,
  deleteLot,
  deleteLotBatch,
  type EquipSelectItem,
  selectByWorkSheetId,
  selectWeekWorkSheet,
  updateStae,
} from '#/api';
import { $t } from '#/locales';

import EquipmentSelectDrawer from '../drawers/EquipmentSelectDrawer.vue';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序（搅拌机为 6，混合水为 1），由外部传入 */
  processType: { type: Number, default: 6 },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

const queryParams = ref<any>({
  lineName: '',
  planDateStart: '',
});

/** 查询搅拌机工单列表 */
async function queryWorkSheetList({ page }: any) {
  const res = await selectWeekWorkSheet({
    lineName: queryParams.value.lineName,
    processType: props.processType,
    planDateStart: queryParams.value.planDateStart,
    page: page.currentPage,
    pageSize: page.pageSize,
  });
  return { total: res.total, items: res.list };
}

/** 搅拌机工单列表 */
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'workSheetCode',
      title: $t('mixerLotManage.workSheetCode'),
      minWidth: 170,
    },
    {
      field: 'productCode',
      title: $t('mixerLotManage.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixerLotManage.productName'),
      minWidth: 130,
    },
    {
      field: 'planDateStart',
      title: $t('mixerLotManage.planDateStart'),
      minWidth: 120,
    },
    { field: 'lineName', title: $t('mixerLotManage.lineName'), minWidth: 110 },
    { field: 'priority', title: $t('mixerLotManage.priority'), minWidth: 80 },
    {
      field: 'indicateBatch',
      title: $t('mixerLotManage.indicateBatch'),
      minWidth: 100,
    },
    {
      field: 'produceBatch',
      title: $t('mixerLotManage.produceBatch'),
      minWidth: 100,
    },
    {
      field: 'remainBatch',
      title: $t('mixerLotManage.remainBatch'),
      minWidth: 100,
    },
    { field: 'unit', title: $t('mixerLotManage.unit'), minWidth: 80 },
  ],
  height: 500,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  pagerConfig: { enabled: true, pageSize: 20 },
  proxyConfig: {
    ajax: {
      query: queryWorkSheetList,
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const gridEvents: any = {
  radioChange: ({ row }: any) => {
    selectedWorkSheet.value = row;
    // 切换选中工单时，重新查询下方批次列表
    refreshBatchGrid();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const selectedWorkSheet = ref<any>(null);

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = { lineName: '', planDateStart: '' };
  gridApi.reload();
}
// endregion

// region 中间：生成 / 批量生成
const batchQty = ref<number>(1);

/** 设备编号（工序 2 混合 MIX 时展示并随生成接口提交） */
const equipCodeInput = ref<string>('');

/** 设备选择抽屉 ref */
const equipmentDrawerRef = ref();

/** 已选设备列表（用于打开抽屉时恢复选中状态） */
const selectedEquipments = ref<EquipSelectItem[]>([]);

/**
 * 打开设备选择抽屉。
 * @since 2026-08-31
 */
function handleOpenEquipSelect() {
  equipmentDrawerRef.value.open(selectedEquipments.value);
}

/**
 * 设备选择回调：将选中的设备编号回填到输入框。
 * @param rows 抽屉中选中的设备列表
 * @since 2026-08-31
 */
function handleEquipSelect(rows: EquipSelectItem[]) {
  selectedEquipments.value = rows || [];
  if (rows && rows.length > 0) {
    equipCodeInput.value = rows[0]?.equipmentCode || '';
  }
}

/** 生成单个批次 */
function handleGenerate() {
  const ws = selectedWorkSheet.value;
  if (!ws) {
    message.warning($t('mixerLotManage.plsSelectWorkSheet'));
    return;
  }
  const payload: any = { id: ws.id, batch: batchQty.value };
  if (props.processType === 2) {
    if (!equipCodeInput.value) {
      message.warning($t('mixerLotManage.plsSelectEquip'));
      return;
    }
    payload.equipCode = equipCodeInput.value;
  }
  addLot(payload)
    .then(() => {
      refreshBatchGrid();
      gridApi.reload();
      message.success($t('mixerLotManage.generated'));
    })
    .catch(() => {
      message.error($t('mixerLotManage.generateFailed'));
    });
}

/** 批量生成批次 */
function handleBatchGenerate() {
  const ws = selectedWorkSheet.value;
  if (!ws) {
    message.warning($t('mixerLotManage.plsSelectWorkSheet'));
    return;
  }
  if (!batchQty.value || batchQty.value < 1) {
    message.warning($t('mixerLotManage.plsInputBatch'));
    return;
  }
  addBatch({ id: ws.id, batch: batchQty.value })
    .then(() => {
      refreshBatchGrid();
      gridApi.reload();
      message.success($t('mixerLotManage.generated'));
    })
    .catch(() => {
      message.error($t('mixerLotManage.generateFailed'));
    });
}

/** 追加创建批次（仅混合水工序 processType === 1 时展示） */
function handleAppendCreate() {
  const ws = selectedWorkSheet.value;
  if (!ws) {
    message.warning($t('mixerLotManage.plsSelectWorkSheet'));
    return;
  }
  if (!batchQty.value || batchQty.value < 1) {
    message.warning($t('mixerLotManage.plsInputBatch'));
    return;
  }
  addCreate({ id: ws.id, batch: batchQty.value })
    .then(() => {
      refreshBatchGrid();
      gridApi.reload();
      message.success($t('mixerLotManage.generated'));
    })
    .catch(() => {
      message.error($t('mixerLotManage.generateFailed'));
    });
}
// endregion

// region 下方：批次列表
/** 状态格式化：1生成 2进行中 3完成 */
function formatState(cellValue: number) {
  const stateMap: Record<number, string> = {
    1: $t('mixerLotManage.stateGenerated'),
    2: $t('mixerLotManage.stateProcessing'),
    3: $t('mixerLotManage.stateCompleted'),
  };
  return stateMap[cellValue] ?? '-';
}

/** 状态颜色映射：1生成 2进行中 3完成 */
const stateColorMap: Record<number, string> = {
  1: 'processing',
  2: 'warning',
  3: 'success',
};

/** 查询选中工单的批次 LOT 列表 */
async function queryBatchList() {
  selectedBatchRecords.value = [];
  const ws = selectedWorkSheet.value;
  if (!ws?.id) {
    return { total: 0, items: [] };
  }
  const res = await selectByWorkSheetId(ws.id);
  const list = Array.isArray(res) ? res : [];
  return { total: list.length, items: list };
}

/** 批次列表列定义：搅拌机 processType === 6 与混合水 processType === 1 字段不同 */
function getBatchColumns(): any {
  if (props.processType === 1) {
    return [
      { type: 'checkbox', width: 50, title: '' },
      { field: 'lotCode', title: $t('mixerLotManage.lotCode'), minWidth: 120 },
      {
        field: 'productCode',
        title: $t('mixerLotManage.productCode'),
        minWidth: 110,
      },
      {
        field: 'productName',
        title: $t('mixerLotManage.productName'),
        minWidth: 130,
      },
      { field: 'batch', title: $t('mixerLotManage.batch'), minWidth: 90 },
      { field: 'unit', title: $t('mixerLotManage.unit'), minWidth: 80 },
      {
        field: 'isTransfer',
        title: $t('mixerLotManage.isTransfer'),
        minWidth: 100,
        slots: { default: 'isTransfer' },
      },
      {
        field: 'fullUse',
        title: $t('mixerLotManage.trayIssued'),
        minWidth: 140,
        slots: { default: 'fullUse' },
      },
      {
        field: 'state',
        title: $t('mixerLotManage.state'),
        minWidth: 100,
        slots: { default: 'state' },
      },
    ];
  }
  return [
    { type: 'checkbox', width: 50, title: '' },
    { type: 'seq', width: 50, title: '#' },
    { field: 'lotCode', title: $t('mixerLotManage.lotCode'), minWidth: 120 },
    {
      field: 'productCode',
      title: $t('mixerLotManage.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixerLotManage.productName'),
      minWidth: 130,
    },
    {
      field: 'fullUse',
      title: $t('mixerLotManage.fullUse'),
      minWidth: 140,
      slots: { default: 'fullUse' },
    },
    {
      field: 'looseUse',
      title: $t('mixerLotManage.looseUse'),
      minWidth: 140,
      slots: { default: 'looseUse' },
    },
    {
      field: 'state',
      title: $t('mixerLotManage.state'),
      minWidth: 100,
      slots: { default: 'state' },
    },
    { field: 'weight', title: $t('mixerLotManage.weight'), minWidth: 100 },
    { field: 'unit', title: $t('mixerLotManage.unit'), minWidth: 80 },
    { field: 'batch', title: $t('mixerLotManage.batch'), minWidth: 90 },
  ];
}

const gridOptions2: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: getBatchColumns(),
  height: 500,
  stripe: true,
  checkboxConfig: { trigger: 'row', highlight: true },
  pagerConfig: { enabled: false, pageSize: 20 },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
  proxyConfig: {
    ajax: {
      query: queryBatchList,
    },
  },
};

/** 批次列表勾选的记录 */
const selectedBatchRecords = ref<any[]>([]);

const gridEvents2: any = {
  checkboxChange: ({ records }: any) => {
    selectedBatchRecords.value = records || [];
  },
};

const [Grid2, gridApi2] = useVbenVxeGrid({
  gridEvents: gridEvents2,
  gridOptions: gridOptions2,
});

/** 工序类型变化时，切换批次列表的列字段 */
watch(
  () => props.processType,
  () => {
    gridApi2.setGridOptions({ columns: getBatchColumns() });
  },
  { immediate: true },
);

/** 开始：二次确认后将勾选的批次更新为进行中状态 */
function handleBatchStart() {
  const records = selectedBatchRecords.value;
  if (records.length === 0) {
    message.warning($t('mixerLotManage.plsSelectBatch'));
    return;
  }
  Modal.confirm({
    title: $t('mixerLotManage.startConfirmTitle'),
    content: $t('mixerLotManage.startConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await updateStae(
          records.map((record: any) => record.id),
          2,
        );
        message.success($t('mixerLotManage.startSuccess'));
        refreshBatchGrid();
      } catch {
        message.error($t('mixerLotManage.startFailed'));
      }
    },
  });
}

/** 结束：二次确认后将勾选的批次更新为完成状态（仅混合 MIX 工序 processType === 2） */
function handleBatchFinish() {
  const records = selectedBatchRecords.value;
  if (records.length === 0) {
    message.warning($t('mixerLotManage.plsSelectBatch'));
    return;
  }
  Modal.confirm({
    title: $t('mixerLotManage.finishConfirmTitle'),
    content: $t('mixerLotManage.finishConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await updateStae(
          records.map((record: any) => record.id),
          3,
        );
        message.success($t('mixerLotManage.finishSuccess'));
        refreshBatchGrid();
      } catch {
        message.error($t('mixerLotManage.finishFailed'));
      }
    },
  });
}

/** 删除：二次确认后删除勾选的批次 */
function handleBatchDelete() {
  const records = selectedBatchRecords.value;
  if (records.length === 0) {
    message.warning($t('mixerLotManage.plsSelectBatch'));
    return;
  }
  Modal.confirm({
    title: $t('mixerLotManage.deleteConfirmTitle'),
    content: $t('mixerLotManage.deleteConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await deleteLot(records.map((record: any) => record.id));
        message.success($t('mixerLotManage.deleteSuccess'));
        refreshBatchGrid();
      } catch {
        message.error($t('mixerLotManage.deleteFailed'));
      }
    },
  });
}

/** 混合水工序（processType === 1）：删除勾选的批次（排产队列） */
function handlePlanQueueDelete() {
  const records = selectedBatchRecords.value;
  if (records.length === 0) {
    message.warning($t('mixerLotManage.plsSelectBatch'));
    return;
  }
  Modal.confirm({
    title: $t('mixerLotManage.deleteConfirmTitle'),
    content: $t('mixerLotManage.deleteConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: async () => {
      try {
        await deleteLotBatch(records.map((record: any) => record.id));
        message.success($t('mixerLotManage.deleteSuccess'));
        refreshBatchGrid();
      } catch {
        message.error($t('mixerLotManage.deleteFailed'));
      }
    },
  });
}

/** 刷新批次列表（重新调用接口查询） */
function refreshBatchGrid() {
  gridApi2.reload();
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 顶部：查询条件 -->
    <Card :title="$t('mixerLotManage.queryCondition')">
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixerLotManage.lineName')">
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="$t('mixerLotManage.lineNamePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixerLotManage.planDateStart')">
          <DatePicker
            v-model:value="queryParams.planDateStart"
            value-format="YYYY-MM-DD"
            :placeholder="$t('mixerLotManage.datePlaceholder')"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </Button>
            <Button @click="handleReset">
              {{ $t('common.reset') }}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>

    <!-- 中间：搅拌机工单列表 -->
    <Card :title="$t('mixerLotManage.workSheetList')">
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </Card>

    <!-- 中间：批次数量输入 + 生成按钮 -->
    <div
      class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ $t('mixerLotManage.batchPerTime') }}</span>
        <InputNumber v-model:value="batchQty" :min="1" :max="9999" />
        <template v-if="processType === 2">
          <span class="font-medium">{{ $t('mixerLotManage.equipCode') }}</span>
          <Input
            v-model:value="equipCodeInput"
            :placeholder="$t('mixerLotManage.equipCodePlaceholder')"
            disabled
            style="width: 160px"
          />
          <Button @click="handleOpenEquipSelect">
            <Icon
              icon="mdi:format-list-bulleted"
              class="inline-block align-middle"
            />
            {{ $t('mixerLotManage.selectEquip') }}
          </Button>
        </template>
      </div>
      <Space>
        <Button v-if="processType === 1" @click="handleAppendCreate">
          {{ $t('mixerLotManage.appendCreate') }}
        </Button>
        <Button v-if="processType !== 2" @click="handleBatchGenerate">
          {{ $t('mixerLotManage.batchGenerate') }}
        </Button>
        <Button type="primary" @click="handleGenerate">
          {{ $t('mixerLotManage.generate') }}
        </Button>
      </Space>
    </div>

    <!-- 下方：批次列表（按选中的工单实时查询） -->
    <Card :title="$t('mixerLotManage.batchList')">
      <Grid2>
        <template #toolbar-tools></template>
        <template #state="{ row }">
          <Tag :color="stateColorMap[row.state] || 'default'">
            {{ formatState(row.state) }}
          </Tag>
        </template>
        <template #fullUse="{ row }">
          <Checkbox :checked="row.fullUse === 1" disabled />
        </template>
        <template #looseUse="{ row }">
          <Checkbox :checked="row.looseUse === 1" disabled />
        </template>
        <template #isTransfer="{ row }">
          <Checkbox :checked="row.isTransfer === 1" disabled />
        </template>
      </Grid2>
      <!-- 表格右下角：批次操作按钮（需勾选批次后才能使用） -->
      <div class="mt-3 flex justify-end gap-3">
        <!-- 搅拌机工序（processType === 6）：开始 / 删除 -->
        <template v-if="processType === 6">
          <Button
            :disabled="selectedBatchRecords.length === 0"
            @click="handleBatchStart"
          >
            {{ $t('mixerLotManage.start') }}
          </Button>
          <Button
            danger
            :disabled="selectedBatchRecords.length === 0"
            @click="handleBatchDelete"
          >
            {{ $t('mixerLotManage.delete') }}
          </Button>
        </template>
        <!-- 混合 MIX 工序（processType === 2）：开始 / 结束 -->
        <template v-else-if="processType === 2">
          <Button
            :disabled="selectedBatchRecords.length === 0"
            @click="handleBatchStart"
          >
            {{ $t('mixerLotManage.start') }}
          </Button>
          <Button
            :disabled="selectedBatchRecords.length === 0"
            @click="handleBatchFinish"
          >
            {{ $t('mixerLotManage.finish') }}
          </Button>
        </template>
        <!-- 混合水工序（processType === 1）：删除 -->
        <template v-else>
          <Button
            danger
            :disabled="selectedBatchRecords.length === 0"
            @click="handlePlanQueueDelete"
          >
            {{ $t('common.delete') }}
          </Button>
        </template>
      </div>
    </Card>

    <!-- 设备选择抽屉 -->
    <EquipmentSelectDrawer
      ref="equipmentDrawerRef"
      @select="handleEquipSelect"
    />
  </div>
</template>
