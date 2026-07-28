<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
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
  line: '',
});

// 假数据：工单列表（接口就绪后替换为接口返回）
const fakeWorksheets: any[] = [
  {
    indicateDate: '2026-07-19',
    indicateNo: 'IND-20260719-001',
    lineCode: 'L01',
    lineName: '配料一线',
    workStartTime: '2026-07-19 08:00:00',
    workEndTime: '2026-07-19 17:00:00',
    priority: '高',
    productCode: 'P-001',
    productName: '混合水饮品A',
    indicateBatchCount: 12,
    batchQty: 120,
    completedQty: 60,
  },
  {
    indicateDate: '2026-07-19',
    indicateNo: 'IND-20260719-002',
    lineCode: 'L02',
    lineName: '配料二线',
    workStartTime: '2026-07-19 09:00:00',
    workEndTime: '2026-07-19 18:00:00',
    priority: '中',
    productCode: 'P-002',
    productName: '混合水饮品B',
    indicateBatchCount: 8,
    batchQty: 80,
    completedQty: 30,
  },
  {
    indicateDate: '2026-07-18',
    indicateNo: 'IND-20260718-003',
    lineCode: 'L01',
    lineName: '配料一线',
    workStartTime: '2026-07-18 08:30:00',
    workEndTime: '2026-07-18 16:30:00',
    priority: '低',
    productCode: 'P-003',
    productName: '混合水饮品C',
    indicateBatchCount: 5,
    batchQty: 50,
    completedQty: 50,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    { field: 'lineCode', title: $t('mixedWorkProgress.lineCode'), minWidth: 100 },
    { field: 'lineName', title: $t('mixedWorkProgress.lineName'), minWidth: 120 },
    {
      field: 'indicateNo',
      title: $t('mixedWorkProgress.indicateNo'),
      minWidth: 160,
    },
    {
      field: 'indicateDate',
      title: $t('mixedWorkProgress.indicateDate'),
      minWidth: 120,
    },
    {
      field: 'workStartTime',
      title: $t('mixedWorkProgress.workStartTime'),
      minWidth: 160,
    },
    {
      field: 'workEndTime',
      title: $t('mixedWorkProgress.workEndTime'),
      minWidth: 160,
    },
    { field: 'priority', title: $t('mixedWorkProgress.priority'), minWidth: 90 },
    {
      field: 'productCode',
      title: $t('mixedWorkProgress.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('mixedWorkProgress.productName'),
      minWidth: 140,
    },
    {
      field: 'indicateBatchCount',
      title: $t('mixedWorkProgress.indicateBatchCount'),
      minWidth: 110,
    },
    {
      field: 'batchQty',
      title: $t('mixedWorkProgress.batchQty'),
      minWidth: 130,
    },
    {
      field: 'completedQty',
      title: $t('mixedWorkProgress.completedQty'),
      minWidth: 100,
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
    const { indicateDateRange, line } = queryParams.value;
    let list = fakeWorksheets.filter((item) => {
      const m1 =
        !line || item.lineCode.includes(line) || item.lineName.includes(line);
      const m2 =
        !indicateDateRange ||
        indicateDateRange.length !== 2 ||
        (item.indicateDate >= indicateDateRange[0] &&
          item.indicateDate <= indicateDateRange[1]);
      return m1 && m2;
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
  queryParams.value = { indicateDateRange: [], line: '' };
  gridApi.reload();
}
// endregion

// region 工作批次数 + 设备输入
const workBatchCount = ref<number>();
const equipInput = ref<string>('');
// endregion

// region 批次LOT列表（多选）
const lotData = ref<any[]>([]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'lotId', title: $t('mixedWorkProgress.lotId'), minWidth: 180 },
    {
      field: 'cakesPerBatch',
      title: $t('mixedWorkProgress.cakesPerBatch'),
      minWidth: 120,
    },
    {
      field: 'batchCount',
      title: $t('mixedWorkProgress.batchCount'),
      minWidth: 90,
    },
    {
      field: 'startTime',
      title: $t('mixedWorkProgress.startTime'),
      minWidth: 170,
    },
    { field: 'endTime', title: $t('mixedWorkProgress.endTime'), minWidth: 170 },
  ],
  data: lotData.value,
  height: 340,
  stripe: true,
  checkboxConfig: { trigger: 'row', highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const lotGridEvents: any = {
  checkboxChange: ({ records }: any) => {
    selectedLots.value = records;
  },
  checkboxAll: ({ records }: any) => {
    selectedLots.value = records;
  },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({
  gridOptions: lotGridOptions,
  gridEvents: lotGridEvents,
});

const selectedLots = ref<any[]>([]);

// 选中工单后加载对应批次LOT（假数据）
function loadLotByWorksheet() {
  if (!selectedWorksheet.value) return;
  const code = selectedWorksheet.value.indicateNo;
  lotData.value = Array.from({ length: 3 }, (_, i) => ({
    lotId: `${code}-LOT-${String(i + 1).padStart(2, '0')}`,
    cakesPerBatch: 100,
    batchCount: (i + 1) * 2,
    startTime: '',
    endTime: '',
    batchStarted: false,
    batchEnded: false,
  }));
  lotGridApi.grid.loadData([...lotData.value]);
  selectedLots.value = [];
}
// endregion

// region 自动模式 + 工作开始/工作结束控制
const autoMode = ref(false);

function formatNow() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function handleStart() {
  if (!selectedWorksheet.value) {
    message.warning($t('mixedWorkProgress.plsSelectWorksheet'));
    return;
  }
  if (selectedLots.value.length === 0) {
    message.warning($t('mixedWorkProgress.plsSelectLot'));
    return;
  }
  const now = formatNow();
  let changed = 0;
  selectedLots.value.forEach((lot) => {
    if (lot.batchStarted) return;
    lot.batchStarted = true;
    lot.startTime = now;
    // 自动模式：开始即自动结束（连贯作业）
    if (autoMode.value) {
      lot.batchEnded = true;
      lot.endTime = now;
    }
    changed++;
  });
  lotGridApi.grid.loadData([...lotData.value]);
  if (changed) {
    message.success($t('mixedWorkProgress.startSuccess'));
  } else {
    message.warning($t('mixedWorkProgress.alreadyStarted'));
  }
}

function handleEnd() {
  if (!selectedWorksheet.value) {
    message.warning($t('mixedWorkProgress.plsSelectWorksheet'));
    return;
  }
  if (selectedLots.value.length === 0) {
    message.warning($t('mixedWorkProgress.plsSelectLot'));
    return;
  }
  const now = formatNow();
  let changed = 0;
  selectedLots.value.forEach((lot) => {
    if (!lot.batchStarted || lot.batchEnded) return;
    lot.batchEnded = true;
    lot.endTime = now;
    changed++;
  });
  lotGridApi.grid.loadData([...lotData.value]);
  if (changed) {
    message.success($t('mixedWorkProgress.endSuccess'));
  } else {
    message.warning($t('mixedWorkProgress.alreadyEnded'));
  }
}
// endregion

onMounted(() => {
  gridApi.reload();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('mixedWorkProgress.title') }}</div>

    <!-- 1. 查询条件 + 2. 工单列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWorkProgress.worksheetList') }}</div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWorkProgress.indicateDate')">
          <RangePicker
            v-model:value="queryParams.indicateDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWorkProgress.line')">
          <Input
            v-model:value="queryParams.line"
            :placeholder="$t('mixedWorkProgress.linePlaceholder')"
            allow-clear
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

    <!-- 3. 工作批次数 + 设备输入 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Row :gutter="16" class="items-end">
        <Col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixedWorkProgress.workBatchCount') }}
          </div>
          <InputNumber
            v-model:value="workBatchCount"
            class="w-full"
            :min="0"
            :placeholder="$t('mixedWorkProgress.workBatchCountPlaceholder')"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="mb-1 text-sm font-medium">
            {{ $t('mixedWorkProgress.equipCode') }}
          </div>
          <Input
            v-model:value="equipInput"
            :placeholder="$t('mixedWorkProgress.equipPlaceholder')"
            allow-clear
          />
        </Col>
      </Row>
    </div>

    <!-- 4. 批次LOT列表（多选） -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('mixedWorkProgress.lotList') }}</div>
      <LotGrid>
        <template #toolbar-tools></template>
      </LotGrid>

      <!-- 5. 左边自动模式切换，右边工作开始/工作结束按钮 -->
      <Row class="mt-3 flex items-center" :gutter="16">
        <Col flex="auto" class="flex items-center gap-2">
          <span class="text-sm font-medium">
            {{ $t('mixedWorkProgress.autoMode') }}
          </span>
          <Switch v-model:checked="autoMode" />
        </Col>
        <Col flex="none">
          <Space>
            <Button type="primary" @click="handleStart">
              {{ $t('mixedWorkProgress.workStart') }}
            </Button>
            <Button @click="handleEnd">
              {{ $t('mixedWorkProgress.workEnd') }}
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  </div>
</template>
