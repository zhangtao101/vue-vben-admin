<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
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


// region 查询条件：产线 / 产品名称 / 生产日期
const queryParams = ref<any>({
  line: undefined,
  productName: '',
  productDate: '',
});

const lineOptions = [
  { label: $t('noodleMaking.line1'), value: 'L01' },
  { label: $t('noodleMaking.line2'), value: 'L02' },
  { label: $t('noodleMaking.line3'), value: 'L03' },
];
// endregion

// region 批次作业指令列表（假数据，接口就绪后替换为接口返回）
const fakeInstructions: any[] = [
  {
    lineCode: 'L01',
    lineName: '制面一线',
    worksheetCode: 'WO-20260721-001',
    productDate: '2026-07-21',
    priority: '高',
    productCode: 'N-001',
    productName: '三养炸酱面',
    commandBatchCount: 10,
    createdBatchCount: 4,
    badBatchCount: 0,
    remainBatchCount: 6,
  },
  {
    lineCode: 'L02',
    lineName: '制面二线',
    worksheetCode: 'WO-20260721-002',
    productDate: '2026-07-21',
    priority: '中',
    productCode: 'N-002',
    productName: '三养拉面',
    commandBatchCount: 8,
    createdBatchCount: 8,
    badBatchCount: 1,
    remainBatchCount: 0,
  },
  {
    lineCode: 'L03',
    lineName: '制面三线',
    worksheetCode: 'WO-20260720-003',
    productDate: '2026-07-20',
    priority: '低',
    productCode: 'N-003',
    productName: '三养泡面',
    commandBatchCount: 6,
    createdBatchCount: 2,
    badBatchCount: 0,
    remainBatchCount: 4,
  },
  {
    lineCode: 'L01',
    lineName: '制面一线',
    worksheetCode: 'WO-20260719-004',
    productDate: '2026-07-19',
    priority: '高',
    productCode: 'N-004',
    productName: '三养辣白菜面',
    commandBatchCount: 12,
    createdBatchCount: 12,
    badBatchCount: 2,
    remainBatchCount: 0,
  },
];

const instructionData = ref<any[]>([]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'lineCode', title: $t('noodleMaking.lineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('noodleMaking.lineName'), minWidth: 130 },
    {
      field: 'worksheetCode',
      title: $t('noodleMaking.worksheetCode'),
      minWidth: 170,
    },
    {
      field: 'productDate',
      title: $t('noodleMaking.productDate'),
      minWidth: 130,
    },
    { field: 'priority', title: $t('noodleMaking.priority'), minWidth: 90 },
    {
      field: 'productCode',
      title: $t('noodleMaking.productCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('noodleMaking.productName'),
      minWidth: 150,
    },
    {
      field: 'commandBatchCount',
      title: $t('noodleMaking.commandBatchCount'),
      minWidth: 110,
    },
    {
      field: 'createdBatchCount',
      title: $t('noodleMaking.createdBatchCount'),
      minWidth: 110,
    },
    {
      field: 'badBatchCount',
      title: $t('noodleMaking.badBatchCount'),
      minWidth: 100,
    },
    {
      field: 'remainBatchCount',
      title: $t('noodleMaking.remainBatchCount'),
      minWidth: 100,
    },
  ],
  data: instructionData.value,
  height: 340,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function loadInstructions() {
  const { line, productName, productDate } = queryParams.value;
  const list = fakeInstructions.filter((item) => {
    const m1 = !line || item.lineCode === line;
    const m2 =
      !productName ||
      item.productName.includes(productName) ||
      item.productCode.includes(productName);
    const m3 = !productDate || item.productDate === productDate;
    return m1 && m2 && m3;
  });
  instructionData.value = list;
  gridApi.grid.loadData([...instructionData.value]);
}

function handleQuery() {
  loadInstructions();
}

function handleReset() {
  queryParams.value = { line: undefined, productName: '', productDate: '' };
  loadInstructions();
}
// endregion

// region 实时数据：5 块（制面压延 / 蒸煮 / 切断成型 / 油炸 / 冷却）
const realtimeBlocks = ref<any[]>([
  {
    key: 'rolling',
    title: $t('noodleMaking.rolling'),
    params: [
      { label: $t('noodleMaking.rpm'), value: 320, unit: 'RPM' },
      {
        label: $t('noodleMaking.thicknessTension'),
        value: 1.25,
        unit: 'N/mm²',
      },
    ],
  },
  {
    key: 'cooking',
    title: $t('noodleMaking.cooking'),
    params: [
      { label: $t('noodleMaking.temperature'), value: 100, unit: '℃' },
      {
        label: $t('noodleMaking.steamPressure'),
        value: 0.4,
        unit: 'MPa',
      },
      { label: $t('noodleMaking.cookingTime'), value: 90, unit: 's' },
      {
        label: $t('noodleMaking.beltSpeed'),
        value: 2.5,
        unit: 'm/min',
      },
      {
        label: $t('noodleMaking.steamAmount'),
        value: 120,
        unit: 'kg/h',
      },
    ],
  },
  {
    key: 'cutting',
    title: $t('noodleMaking.cutting'),
    params: [
      { label: $t('noodleMaking.cutCount'), value: 1500, unit: $t('noodleMaking.pcs') },
      {
        label: $t('noodleMaking.abnormalAlarm'),
        value: $t('noodleMaking.normal'),
        unit: '',
        isAlarm: true,
      },
    ],
  },
  {
    key: 'frying',
    title: $t('noodleMaking.frying'),
    params: [
      { label: $t('noodleMaking.temperature'), value: 175, unit: '℃' },
      { label: $t('noodleMaking.pressure'), value: 0.2, unit: 'MPa' },
      { label: $t('noodleMaking.level'), value: 65, unit: '%' },
      { label: $t('noodleMaking.fryingTime'), value: 60, unit: 's' },
      { label: $t('noodleMaking.palmOil'), value: 800, unit: 'L' },
      {
        label: $t('noodleMaking.alarm'),
        value: $t('noodleMaking.normal'),
        unit: '',
        isAlarm: true,
      },
    ],
  },
  {
    key: 'cooling',
    title: $t('noodleMaking.cooling'),
    params: [
      { label: $t('noodleMaking.inletTemp'), value: 60, unit: '℃' },
      {
        label: $t('noodleMaking.outletTemp'),
        value: 35,
        unit: '℃',
      },
      { label: $t('noodleMaking.coolingTime'), value: 120, unit: 's' },
      {
        label: $t('noodleMaking.alarm'),
        value: $t('noodleMaking.normal'),
        unit: '',
        isAlarm: true,
      },
    ],
  },
]);

function alarmClass(param: any) {
  if (!param.isAlarm) return 'text-foreground';
  return param.value === $t('noodleMaking.normal')
    ? 'text-success'
    : 'text-destructive';
}
// endregion

onMounted(() => {
  loadInstructions();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('noodleMaking.title') }}</div>

    <!-- 1. 查询条件 + 2. 批次作业指令列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('noodleMaking.line')">
          <Select
            v-model:value="queryParams.line"
            :options="lineOptions"
            :placeholder="$t('noodleMaking.linePlaceholder')"
            allow-clear
            style="width: 180px"
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMaking.productName')">
          <Input
            v-model:value="queryParams.productName"
            :placeholder="$t('noodleMaking.productNamePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('noodleMaking.productDate')">
          <DatePicker
            v-model:value="queryParams.productDate"
            value-format="YYYY-MM-DD"
            :placeholder="$t('noodleMaking.productDatePlaceholder')"
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

      <div class="mb-2 font-bold">{{ $t('noodleMaking.instructionList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 3. 实时数据：5 块内容 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('noodleMaking.realtimeData') }}</div>
      <Row :gutter="16">
        <Col
          v-for="block in realtimeBlocks"
          :key="block.key"
          :xs="24"
          :sm="12"
          :lg="8"
          class="mb-4"
        >
          <div
            class="flex h-full flex-col rounded-md border border-border bg-muted/40 p-3"
          >
            <!-- 图片占位 -->
            <div
              class="mb-3 flex h-28 items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground"
            >
              {{ $t('noodleMaking.imagePlaceholder') }}
            </div>
            <!-- 标题 -->
            <div class="mb-2 font-bold text-primary">
              {{ block.title }}
            </div>
            <!-- 实时参数 -->
            <div class="flex flex-col gap-1">
              <div
                v-for="(param, idx) in block.params"
                :key="idx"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-muted-foreground">{{ param.label }}</span>
                <span :class="alarmClass(param)" class="font-semibold">
                  {{ param.value }}<template v-if="param.unit"> {{ param.unit }}</template>
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>
