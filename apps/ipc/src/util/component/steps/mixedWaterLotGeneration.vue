<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
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

// region 顶部：批次作业指令信息
const queryParams = ref<any>({
  lineName: '',
  productName: '',
  produceDate: '',
});

// 假数据：批次作业指令（接口就绪后替换为接口返回）
const fakeInstructions: any[] = [
  {
    lineCode: 'L01',
    lineName: '混合水一线',
    worksheetCode: 'WO-20260720-001',
    produceDate: '2026-07-20',
    priority: '高',
    productCode: 'MW-001',
    productName: '纯净水A',
    instructionBatchCount: 10,
    createdBatchCount: 3,
    defectiveBatchCount: 1,
    remainBatchCount: 6,
  },
  {
    lineCode: 'L02',
    lineName: '混合水二线',
    worksheetCode: 'WO-20260720-002',
    produceDate: '2026-07-20',
    priority: '中',
    productCode: 'MW-002',
    productName: '矿物质水B',
    instructionBatchCount: 8,
    createdBatchCount: 2,
    defectiveBatchCount: 0,
    remainBatchCount: 6,
  },
  {
    lineCode: 'L01',
    lineName: '混合水一线',
    worksheetCode: 'WO-20260719-003',
    produceDate: '2026-07-19',
    priority: '低',
    productCode: 'MW-003',
    productName: '苏打水C',
    instructionBatchCount: 5,
    createdBatchCount: 5,
    defectiveBatchCount: 1,
    remainBatchCount: 0,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    { field: 'lineCode', title: $t('mixedWaterLot.lineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('mixedWaterLot.lineName'), minWidth: 120 },
    {
      field: 'worksheetCode',
      title: $t('mixedWaterLot.worksheetCode'),
      minWidth: 170,
    },
    {
      field: 'produceDate',
      title: $t('mixedWaterLot.produceDate'),
      minWidth: 120,
    },
    { field: 'priority', title: $t('mixedWaterLot.priority'), minWidth: 80 },
    {
      field: 'productCode',
      title: $t('mixedWaterLot.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixedWaterLot.productName'),
      minWidth: 120,
    },
    {
      field: 'instructionBatchCount',
      title: $t('mixedWaterLot.instructionBatchCount'),
      minWidth: 120,
    },
    {
      field: 'createdBatchCount',
      title: $t('mixedWaterLot.createdBatchCount'),
      minWidth: 120,
    },
    {
      field: 'defectiveBatchCount',
      title: $t('mixedWaterLot.defectiveBatchCount'),
      minWidth: 110,
    },
    {
      field: 'remainBatchCount',
      title: $t('mixedWaterLot.remainBatchCount'),
      minWidth: 110,
    },
  ],
  height: 300,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryInstruction({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const gridEvents: any = {
  radioChange: ({ row }: any) => {
    selectedInstruction.value = row;
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const selectedInstruction = ref<any>(null);

function queryInstruction({ page, pageSize }: any) {
  return new Promise((resolve) => {
    const { lineName, productName, produceDate } = queryParams.value;
    let list = fakeInstructions.filter((item) => {
      const m1 =
        !lineName ||
        item.lineName.includes(lineName) ||
        item.lineCode.includes(lineName);
      const m2 =
        !productName ||
        item.productName.includes(productName) ||
        item.productCode.includes(productName);
      const m3 = !produceDate || item.produceDate === produceDate;
      return m1 && m2 && m3;
    });
    const total = list.length;
    const start = (page - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    resolve({ total, items: list });
  });
}

function handleQuery() {
  gridApi.reload();
}

function handleReset() {
  queryParams.value = { lineName: '', productName: '', produceDate: '' };
  gridApi.reload();
}
// endregion

// region 中间：批次数量 + 操作按钮
const batchQty = ref<number>(1);
let lotSeq = 0;

function buildBatchRow() {
  const ins = selectedInstruction.value;
  if (!ins) {
    message.warning($t('mixedWaterLot.plsSelectInstruction'));
    return null;
  }
  lotSeq += 1;
  return {
    lotNo: `LOT-${ins.productCode}-${String(lotSeq).padStart(3, '0')}`,
    instructionCode: ins.worksheetCode,
    productCode: ins.productCode,
    productName: ins.productName,
    batchQty: batchQty.value,
    unit: 'L',
    transmitted: $t('common.no'),
    trayIssued: $t('common.no'),
    lotStatus: $t('mixedWaterLot.create'),
  };
}

function pushBatchRow() {
  const row = buildBatchRow();
  if (!row) return false;
  batchData.value.push(row);
  refreshBatchGrid();
  return true;
}

function handleCreate() {
  if (pushBatchRow()) {
    message.success($t('mixedWaterLot.created'));
  }
}

function handleAppend() {
  if (pushBatchRow()) {
    message.success($t('mixedWaterLot.appended'));
  }
}

function handleBatchCreate() {
  const ins = selectedInstruction.value;
  if (!ins) {
    message.warning($t('mixedWaterLot.plsSelectInstruction'));
    return;
  }
  const remain = Number(ins.remainBatchCount) || 0;
  if (remain <= 0) {
    message.warning($t('mixedWaterLot.noRemain'));
    return;
  }
  for (let i = 0; i < remain; i++) {
    pushBatchRow();
  }
  message.success(
    $t('mixedWaterLot.batchCreated', { count: remain }),
  );
}
// endregion

// region 下方：批次列表
const batchData = ref<any[]>([]);

const gridOptions2: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'instructionCode',
      title: $t('mixedWaterLot.instructionCode'),
      minWidth: 180,
    },
    {
      field: 'productCode',
      title: $t('mixedWaterLot.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('mixedWaterLot.productName'),
      minWidth: 120,
    },
    { field: 'batchQty', title: $t('mixedWaterLot.batchQty'), minWidth: 100 },
    { field: 'unit', title: $t('mixedWaterLot.unit'), minWidth: 80 },
    {
      field: 'transmitted',
      title: $t('mixedWaterLot.transmitted'),
      minWidth: 100,
    },
    {
      field: 'trayIssued',
      title: $t('mixedWaterLot.trayIssued'),
      minWidth: 120,
    },
    { field: 'lotStatus', title: $t('mixedWaterLot.lotStatus'), minWidth: 100 },
  ],
  data: batchData.value,
  height: 300,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid2, gridApi2] = useVbenVxeGrid({ gridOptions: gridOptions2 });

function refreshBatchGrid() {
  gridApi2.grid.loadData([...batchData.value]);
}

function handleSave() {
  if (batchData.value.length === 0) {
    message.warning($t('mixedWaterLot.emptyBatch'));
    return;
  }
  // 假数据：仅提示保存成功
  message.success($t('mixedWaterLot.saved'));
}

function handleDelete() {
  const checked = gridApi2.grid.getCheckboxRecords();
  if (checked.length === 0) {
    message.warning($t('mixedWaterLot.plsCheckDelete'));
    return;
  }
  const keys = new Set(checked.map((r: any) => r.lotNo));
  batchData.value = batchData.value.filter((r) => !keys.has(r.lotNo));
  refreshBatchGrid();
  message.success(
    $t('mixedWaterLot.deleted', { count: checked.length }),
  );
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 顶部：批次作业指令信息查询与表格 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWaterLot.instructionInfo') }}</div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWaterLot.line')">
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="$t('mixedWaterLot.linePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterLot.productName')">
          <Input
            v-model:value="queryParams.productName"
            :placeholder="$t('mixedWaterLot.productNamePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterLot.produceDate')">
          <DatePicker
            v-model:value="queryParams.produceDate"
            value-format="YYYY-MM-DD"
            :placeholder="$t('mixedWaterLot.datePlaceholder')"
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
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 中间：批次数量输入 + 创建按钮 -->
    <div
      class="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ $t('mixedWaterLot.batchQty') }}</span>
        <InputNumber v-model:value="batchQty" :min="1" :max="9999" />
      </div>
      <Space>
        <Button @click="handleAppend">
          {{ $t('mixedWaterLot.appendCreate') }}
        </Button>
        <Button @click="handleBatchCreate">
          {{ $t('mixedWaterLot.batchCreate') }}
        </Button>
        <Button type="primary" @click="handleCreate">
          {{ $t('mixedWaterLot.create') }}
        </Button>
      </Space>
    </div>

    <!-- 下方：批次列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWaterLot.batchList') }}</div>
      <Grid2>
        <template #toolbar-tools></template>
      </Grid2>
    </div>

    <!-- 底部：保存 / 删除 -->
    <div class="flex justify-end gap-2">
      <Button type="primary" @click="handleSave">
        {{ $t('common.save') }}
      </Button>
      <Button danger @click="handleDelete">
        {{ $t('common.delete') }}
      </Button>
    </div>
  </div>
</template>
