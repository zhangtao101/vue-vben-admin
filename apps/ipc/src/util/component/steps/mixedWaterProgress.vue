<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Space,
  Switch,
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

const { RangePicker } = DatePicker;

// region 顶部：查询条件 + 工单列表
const queryParams = ref<any>({
  indicateDateRange: [],
  lineBand: '',
  worksheetCode: '',
  indicateStatus: [],
});

const statusOptions = [
  { label: $t('mixedWaterProgress.statusConfirmed'), value: 'confirmed' },
  { label: $t('mixedWaterProgress.statusInProgress'), value: 'inProgress' },
  { label: $t('mixedWaterProgress.statusCompleted'), value: 'completed' },
];

// 假数据：工单列表（接口就绪后替换为接口返回）
const fakeWorksheets: any[] = [
  {
    indicateDate: '2026-07-19',
    worksheetCode: 'WO-20260719-001',
    lineCode: 'L01',
    lineName: '配料一线',
    equipCode: 'EQ-01',
    equipName: '混合机A',
    productCode: 'P-001',
    productName: '混合水饮品A',
    defectiveBatchCount: 0,
    batchCount: 10,
    unit: 'KG',
    indicateStatus: 'confirmed',
  },
  {
    indicateDate: '2026-07-19',
    worksheetCode: 'WO-20260719-002',
    lineCode: 'L02',
    lineName: '配料二线',
    equipCode: 'EQ-02',
    equipName: '混合机B',
    productCode: 'P-002',
    productName: '混合水饮品B',
    defectiveBatchCount: 1,
    batchCount: 8,
    unit: 'KG',
    indicateStatus: 'inProgress',
  },
  {
    indicateDate: '2026-07-18',
    worksheetCode: 'WO-20260718-003',
    lineCode: 'L01',
    lineName: '配料一线',
    equipCode: 'EQ-01',
    equipName: '混合机A',
    productCode: 'P-003',
    productName: '混合水饮品C',
    defectiveBatchCount: 0,
    batchCount: 5,
    unit: 'KG',
    indicateStatus: 'completed',
  },
];

const statusTextMap: Record<string, string> = {
  confirmed: $t('mixedWaterProgress.statusConfirmed'),
  inProgress: $t('mixedWaterProgress.statusInProgress'),
  completed: $t('mixedWaterProgress.statusCompleted'),
};

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'indicateDate',
      title: $t('mixedWaterProgress.indicateDate'),
      minWidth: 120,
    },
    {
      field: 'worksheetCode',
      title: $t('mixedWaterProgress.worksheetCode'),
      minWidth: 160,
    },
    { field: 'lineCode', title: $t('mixedWaterProgress.lineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('mixedWaterProgress.lineName'), minWidth: 120 },
    { field: 'equipCode', title: $t('mixedWaterProgress.equipCode'), minWidth: 110 },
    { field: 'equipName', title: $t('mixedWaterProgress.equipName'), minWidth: 120 },
    {
      field: 'productCode',
      title: $t('mixedWaterProgress.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('mixedWaterProgress.productName'),
      minWidth: 140,
    },
    {
      field: 'defectiveBatchCount',
      title: $t('mixedWaterProgress.defectiveBatchCount'),
      minWidth: 100,
    },
    {
      field: 'batchCount',
      title: $t('mixedWaterProgress.batchCount'),
      minWidth: 90,
    },
    { field: 'unit', title: $t('mixedWaterProgress.unit'), minWidth: 80 },
    {
      field: 'indicateStatus',
      title: $t('mixedWaterProgress.indicateStatus'),
      minWidth: 100,
      formatter: ({ cellValue }: any) => statusTextMap[cellValue] ?? cellValue,
    },
  ],
  height: 320,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryWorksheet({
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
    selectedWorksheet.value = row;
    loadLotByWorksheet();
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const selectedWorksheet = ref<any>(null);

function queryWorksheet({ page, pageSize }: any) {
  return new Promise((resolve) => {
    const { indicateDateRange, lineBand, worksheetCode, indicateStatus } =
      queryParams.value;
    let list = fakeWorksheets.filter((item) => {
      const m1 =
        !lineBand ||
        item.lineName.includes(lineBand) ||
        item.lineCode.includes(lineBand);
      const m2 = !worksheetCode || item.worksheetCode.includes(worksheetCode);
      const m3 =
        !indicateStatus ||
        indicateStatus.length === 0 ||
        indicateStatus.includes(item.indicateStatus);
      const m4 =
        !indicateDateRange ||
        indicateDateRange.length !== 2 ||
        (item.indicateDate >= indicateDateRange[0] &&
          item.indicateDate <= indicateDateRange[1]);
      return m1 && m2 && m3 && m4;
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
  queryParams.value = {
    indicateDateRange: [],
    lineBand: '',
    worksheetCode: '',
    indicateStatus: [],
  };
  gridApi.reload();
}
// endregion

// region 批次LOT列表
const lotData = ref<any[]>([]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    { field: 'lotId', title: $t('mixedWaterProgress.lotId'), minWidth: 160 },
    { field: 'trayNo', title: $t('mixedWaterProgress.trayNo'), minWidth: 120 },
    {
      field: 'batchCount',
      title: $t('mixedWaterProgress.batchCount'),
      minWidth: 90,
    },
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
      field: 'materialLoaded',
      title: $t('mixedWaterProgress.materialLoaded'),
      minWidth: 110,
      formatter: ({ cellValue }: any) =>
        cellValue ? $t('mixedWaterProgress.yes') : $t('mixedWaterProgress.no'),
    },
    {
      field: 'batchStarted',
      title: $t('mixedWaterProgress.batchStarted'),
      minWidth: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? $t('mixedWaterProgress.yes') : $t('mixedWaterProgress.no'),
    },
    {
      field: 'batchEnded',
      title: $t('mixedWaterProgress.batchEnded'),
      minWidth: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? $t('mixedWaterProgress.yes') : $t('mixedWaterProgress.no'),
    },
  ],
  data: lotData.value,
  height: 340,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const lotGridEvents: any = {
  radioChange: ({ row }: any) => {
    selectedLot.value = row;
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridOptions: lotGridOptions,
  gridEvents: lotGridEvents,
});

const selectedLot = ref<any>(null);

// 选中工单后加载对应批次LOT（假数据）
function loadLotByWorksheet() {
  if (!selectedWorksheet.value) return;
  const code = selectedWorksheet.value.worksheetCode;
  lotData.value = Array.from({ length: 3 }, (_, i) => ({
    lotId: `${code}-LOT-${String(i + 1).padStart(2, '0')}`,
    trayNo: `TRAY-${String(i + 1).padStart(3, '0')}`,
    batchCount: (i + 1) * 2,
    startTime: '',
    endTime: '',
    materialLoaded: i % 2 === 0,
    batchStarted: false,
    batchEnded: i === 2,
  }));
  lotGridApi.grid.loadData([...lotData.value]);
  selectedLot.value = null;
}
// endregion

// region 自动模式 + 开始/结束控制
const autoMode = ref(false);

function formatNow() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function handleStart() {
  if (!selectedLot.value) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  if (selectedLot.value.batchStarted) {
    message.warning($t('mixedWaterProgress.alreadyStarted'));
    return;
  }
  const now = formatNow();
  // 自动模式：开始即自动结束（连贯作业）
  if (autoMode.value) {
    selectedLot.value.batchStarted = true;
    selectedLot.value.startTime = now;
    selectedLot.value.batchEnded = true;
    selectedLot.value.endTime = now;
    message.success($t('mixedWaterProgress.startSuccess'));
  } else {
    selectedLot.value.batchStarted = true;
    selectedLot.value.startTime = now;
    message.success($t('mixedWaterProgress.startSuccess'));
  }
  lotGridApi.grid.loadData([...lotData.value]);
}

function handleEnd() {
  if (!selectedLot.value) {
    message.warning($t('mixedWaterProgress.plsSelectLot'));
    return;
  }
  if (!selectedLot.value.batchStarted) {
    message.warning($t('mixedWaterProgress.alreadyStarted'));
    return;
  }
  if (selectedLot.value.batchEnded) {
    message.warning($t('mixedWaterProgress.alreadyEnded'));
    return;
  }
  selectedLot.value.batchEnded = true;
  selectedLot.value.endTime = formatNow();
  lotGridApi.grid.loadData([...lotData.value]);
  message.success($t('mixedWaterProgress.endSuccess'));
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 顶部：查询条件 + 工单列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWaterProgress.worksheetList') }}</div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWaterProgress.indicateDate')">
          <RangePicker
            v-model:value="queryParams.indicateDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterProgress.lineBand')">
          <Input
            v-model:value="queryParams.lineBand"
            :placeholder="$t('mixedWaterProgress.lineBandPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterProgress.worksheetCode')">
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="$t('mixedWaterProgress.worksheetPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterProgress.indicateStatus')">
          <Checkbox.Group
            v-model:value="queryParams.indicateStatus"
            :options="statusOptions"
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

    <!-- 批次LOT列表 -->
    <div class="my-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWaterProgress.lotList') }}</div>
      <LotGrid>
        <template #toolbar-tools></template>
      </LotGrid>

      <!-- 自动模式开关 + 开始/结束按钮 -->
      <Row class="mt-3 flex items-center" :gutter="16">
        <Col flex="auto" class="flex items-center gap-2">
          <span class="text-sm font-medium">
            {{ $t('mixedWaterProgress.autoMode') }}
          </span>
          <Switch v-model:checked="autoMode" />
        </Col>
        <Col flex="none">
          <Space>
            <Button type="primary" @click="handleStart">
              {{ $t('mixedWaterProgress.start') }}
            </Button>
            <Button @click="handleEnd">
              {{ $t('mixedWaterProgress.end') }}
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  </div>
</template>
