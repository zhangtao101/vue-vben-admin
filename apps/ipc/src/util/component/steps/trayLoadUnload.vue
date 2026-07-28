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
  { label: $t('trayLoadUnload.statusConfirmed'), value: 'confirmed' },
  { label: $t('trayLoadUnload.statusInProgress'), value: 'inProgress' },
  { label: $t('trayLoadUnload.statusCompleted'), value: 'completed' },
];

// 假数据：工单列表（接口就绪后替换为接口返回）
const fakeWorksheets: any[] = [
  {
    indicateDate: '2026-07-19',
    worksheetCode: 'WO-20260719-001',
    lineCode: 'L01',
    lineName: '配料一线',
    equipCode: 'EQ-01',
    equipName: '称量机A',
    materialProductCode: 'MP-001',
    materialProductName: '蛋白粉A',
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
    equipName: '称量机B',
    materialProductCode: 'MP-002',
    materialProductName: '蛋白粉B',
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
    equipName: '称量机A',
    materialProductCode: 'MP-003',
    materialProductName: '蛋白粉C',
    batchCount: 5,
    unit: 'KG',
    indicateStatus: 'completed',
  },
];

const statusTextMap: Record<string, string> = {
  confirmed: $t('trayLoadUnload.statusConfirmed'),
  inProgress: $t('trayLoadUnload.statusInProgress'),
  completed: $t('trayLoadUnload.statusCompleted'),
};

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'indicateDate',
      title: $t('trayLoadUnload.indicateDate'),
      minWidth: 120,
    },
    {
      field: 'worksheetCode',
      title: $t('trayLoadUnload.worksheetCode'),
      minWidth: 160,
    },
    { field: 'lineCode', title: $t('trayLoadUnload.lineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('trayLoadUnload.lineName'), minWidth: 120 },
    { field: 'equipCode', title: $t('trayLoadUnload.equipCode'), minWidth: 110 },
    { field: 'equipName', title: $t('trayLoadUnload.equipName'), minWidth: 120 },
    {
      field: 'materialProductCode',
      title: $t('trayLoadUnload.materialProductCode'),
      minWidth: 140,
    },
    {
      field: 'materialProductName',
      title: $t('trayLoadUnload.materialProductName'),
      minWidth: 140,
    },
    {
      field: 'batchCount',
      title: $t('trayLoadUnload.batchCount'),
      minWidth: 90,
    },
    { field: 'unit', title: $t('trayLoadUnload.unit'), minWidth: 80 },
    {
      field: 'indicateStatus',
      title: $t('trayLoadUnload.indicateStatus'),
      minWidth: 100,
      formatter: ({ cellValue }: any) => statusTextMap[cellValue] ?? cellValue,
    },
  ],
  height: 300,
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
      const m2 =
        !worksheetCode || item.worksheetCode.includes(worksheetCode);
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

// region 下方左：批次LOT列表
const lotData = ref<any[]>([]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    { field: 'lotId', title: $t('trayLoadUnload.lotId'), minWidth: 160 },
    { field: 'trayNo', title: $t('trayLoadUnload.trayNo'), minWidth: 120 },
    {
      field: 'batchCount',
      title: $t('trayLoadUnload.batchCount'),
      minWidth: 90,
    },
    {
      field: 'materialLoaded',
      title: $t('trayLoadUnload.materialLoaded'),
      minWidth: 110,
      formatter: ({ cellValue }: any) =>
        cellValue ? $t('trayLoadUnload.yes') : $t('trayLoadUnload.no'),
    },
    {
      field: 'batchStarted',
      title: $t('trayLoadUnload.batchStarted'),
      minWidth: 120,
      formatter: ({ cellValue }: any) =>
        cellValue ? $t('trayLoadUnload.yes') : $t('trayLoadUnload.no'),
    },
  ],
  data: lotData.value,
  height: 320,
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
    materialLoaded: i % 2 === 0,
    batchStarted: i === 0,
  }));
  lotGridApi.grid.loadData([...lotData.value]);
  selectedLot.value = null;
}

// 托盘变更
function handleTrayChange() {
  if (!selectedLot.value) {
    message.warning($t('trayLoadUnload.plsSelectLot'));
    return;
  }
  message.success($t('trayLoadUnload.trayChangeSuccess'));
}
// endregion

// region 下方右：加载列表
const inputTrayNo = ref('');
const loadData = ref<any[]>([]);

const loadGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'lotId', title: $t('trayLoadUnload.lotId'), minWidth: 160 },
    { field: 'trayNo', title: $t('trayLoadUnload.trayNo'), minWidth: 120 },
    {
      field: 'loadTime',
      title: $t('trayLoadUnload.loadTime'),
      minWidth: 160,
    },
    {
      field: 'loadOperator',
      title: $t('trayLoadUnload.loadOperator'),
      minWidth: 110,
    },
  ],
  data: loadData.value,
  height: 320,
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LoadGrid, loadGridApi] = useVbenVxeGrid({
  gridOptions: loadGridOptions,
});

// 加载：将选中的批次LOT + 托盘号加入加载列表
function handleLoad() {
  if (!selectedLot.value) {
    message.warning($t('trayLoadUnload.plsSelectLot'));
    return;
  }
  if (!inputTrayNo.value) {
    message.warning($t('trayLoadUnload.plsInputTrayNo'));
    return;
  }
  loadData.value.push({
    lotId: selectedLot.value.lotId,
    trayNo: inputTrayNo.value,
    loadTime: formatNow(),
    loadOperator: $t('trayLoadUnload.currentUser'),
  });
  loadGridApi.grid.loadData([...loadData.value]);
  message.success($t('trayLoadUnload.loadSuccess'));
  inputTrayNo.value = '';
}

// 卸载：移除选中的加载记录
function handleUnload() {
  const records = loadGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.warning($t('trayLoadUnload.plsSelectLoadRecord'));
    return;
  }
  const removeSet = new Set(records);
  loadData.value = loadData.value.filter((item) => !removeSet.has(item));
  loadGridApi.grid.loadData([...loadData.value]);
  message.success($t('trayLoadUnload.unloadSuccess'));
}

function formatNow() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
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
      <div class="mb-2 font-bold">{{ $t('trayLoadUnload.worksheetList') }}</div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('trayLoadUnload.indicateDate')">
          <RangePicker
            v-model:value="queryParams.indicateDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('trayLoadUnload.lineBand')">
          <Input
            v-model:value="queryParams.lineBand"
            :placeholder="$t('trayLoadUnload.lineBandPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('trayLoadUnload.worksheetCode')">
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="$t('trayLoadUnload.worksheetPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('trayLoadUnload.indicateStatus')">
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

    <!-- 下方：左右两个区域（xs~lg 上下排列，xl 及以上左右并排） -->
    <Row :gutter="16">
      <!-- 左侧：批次LOT列表 -->
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
        <div class="my-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('trayLoadUnload.lotList') }}</div>
          <LotGrid>
            <template #toolbar-tools>
              <Button class="mr-2" @click="handleTrayChange">
                {{ $t('trayLoadUnload.trayChange') }}
              </Button>
            </template>
          </LotGrid>
        </div>
      </Col>

      <!-- 右侧：加载列表 -->
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
        <div class="my-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('trayLoadUnload.loadList') }}</div>
          <!-- 托盘号输入框 -->
          <div class="mb-3 flex items-center gap-2">
            <span class="text-sm">{{ $t('trayLoadUnload.trayNo') }}：</span>
            <Input
              v-model:value="inputTrayNo"
              class="max-w-60"
              :placeholder="$t('trayLoadUnload.trayNoPlaceholder')"
              allow-clear
            />
          </div>
          <LoadGrid>
            <template #toolbar-tools></template>
          </LoadGrid>
          <!-- 卸载 / 加载 按钮，靠右对齐 -->
          <div class="mt-3 flex justify-end gap-2">
            <Button @click="handleUnload">
              {{ $t('trayLoadUnload.unload') }}
            </Button>
            <Button type="primary" @click="handleLoad">
              {{ $t('trayLoadUnload.load') }}
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>
