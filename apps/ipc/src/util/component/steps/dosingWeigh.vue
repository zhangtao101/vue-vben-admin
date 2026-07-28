<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
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
    lineName: '配料一线',
    lotId: 'LOT-20260720-001',
    worksheetCode: 'WO-20260720-001',
    indicateDate: '2026-07-19',
    priority: '高',
    productCode: 'DW-001',
    productName: '蛋白粉A',
    instructionBatchCount: 10,
    lotBatchCount: 3,
  },
  {
    lineCode: 'L02',
    lineName: '配料二线',
    lotId: 'LOT-20260720-002',
    worksheetCode: 'WO-20260720-002',
    indicateDate: '2026-07-19',
    priority: '中',
    productCode: 'DW-002',
    productName: '蛋白粉B',
    instructionBatchCount: 8,
    lotBatchCount: 2,
  },
  {
    lineCode: 'L01',
    lineName: '配料一线',
    lotId: 'LOT-20260719-003',
    worksheetCode: 'WO-20260719-003',
    indicateDate: '2026-07-18',
    priority: '低',
    productCode: 'DW-003',
    productName: '蛋白粉C',
    instructionBatchCount: 5,
    lotBatchCount: 5,
  },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    { field: 'lineCode', title: $t('dosingWeigh.lineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('dosingWeigh.lineName'), minWidth: 120 },
    { field: 'lotId', title: $t('dosingWeigh.lotId'), minWidth: 160 },
    {
      field: 'worksheetCode',
      title: $t('dosingWeigh.worksheetCode'),
      minWidth: 170,
    },
    {
      field: 'indicateDate',
      title: $t('dosingWeigh.indicateDate'),
      minWidth: 120,
    },
    { field: 'priority', title: $t('dosingWeigh.priority'), minWidth: 80 },
    {
      field: 'productCode',
      title: $t('dosingWeigh.productCode'),
      minWidth: 110,
    },
    {
      field: 'productName',
      title: $t('dosingWeigh.productName'),
      minWidth: 120,
    },
    {
      field: 'instructionBatchCount',
      title: $t('dosingWeigh.instructionBatchCount'),
      minWidth: 120,
    },
    {
      field: 'lotBatchCount',
      title: $t('dosingWeigh.lotBatchCount'),
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
      const m3 = !produceDate || item.indicateDate === produceDate;
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

// region 下方左：原料清单
// 假数据：原料清单（接口就绪后替换为指令对应原料）
const materialData = ref<any[]>([
  {
    materialCode: 'RM-001',
    materialName: '乳清蛋白',
    standardWeight: 50,
    weighedWeight: 0,
    upperLimit: 55,
    lowerLimit: 45,
  },
  {
    materialCode: 'RM-002',
    materialName: '大豆蛋白',
    standardWeight: 30,
    weighedWeight: 0,
    upperLimit: 33,
    lowerLimit: 27,
  },
  {
    materialCode: 'RM-003',
    materialName: '麦芽糊精',
    standardWeight: 20,
    weighedWeight: 0,
    upperLimit: 22,
    lowerLimit: 18,
  },
]);

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'materialCode',
      title: $t('dosingWeigh.materialCode'),
      minWidth: 120,
    },
    {
      field: 'materialName',
      title: $t('dosingWeigh.materialName'),
      minWidth: 130,
    },
    {
      field: 'standardWeight',
      title: $t('dosingWeigh.standardWeight'),
      minWidth: 110,
    },
    {
      field: 'weighedWeight',
      title: $t('dosingWeigh.weighedWeight'),
      minWidth: 110,
    },
    { field: 'upperLimit', title: $t('dosingWeigh.upperLimit'), minWidth: 90 },
    { field: 'lowerLimit', title: $t('dosingWeigh.lowerLimit'), minWidth: 90 },
  ],
  data: materialData.value,
  height: 320,
  stripe: true,
  radioConfig: { trigger: 'row', highlight: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const materialGridEvents: any = {
  radioChange: ({ row }: any) => {
    selectedMaterial.value = row;
  },
};

const [MaterialGrid, materialGridApi] = useVbenVxeGrid({
  gridOptions: materialGridOptions,
  gridEvents: materialGridEvents,
});

const selectedMaterial = ref<any>(null);

// region 称重抽屉（纵向布局）
const weighOpen = ref(false);
const labelIdRef = ref<any>(null);
const labelId = ref('');
const itemCode = ref('');
const materialName = ref('');
const standardWeight = ref(0);
const bagWeight = ref(0);
const upperLimit = ref(0);
const lowerLimit = ref(0);
const realWeight = ref(0);
const weighMethods = ref<string[]>([]);
const bagWeightOptions = [10, 12, 20, 25, 30];
const selectedBagWeight = ref<null | number>(null);

// 进度条比例
const maxScale = computed(() =>
  Math.max(upperLimit.value, standardWeight.value, 10) * 1.5,
);
const fillPercent = computed(() =>
  Math.min(100, (realWeight.value / maxScale.value) * 100),
);
const lowerPercent = computed(() => (lowerLimit.value / maxScale.value) * 100);
const upperPercent = computed(() => (upperLimit.value / maxScale.value) * 100);
const inRange = computed(
  () =>
    realWeight.value >= lowerLimit.value &&
    realWeight.value <= upperLimit.value,
);

let weighTimer: any = null;
let weighPhase = 0;

function startWeighSim() {
  stopWeighSim();
  weighPhase = 0;
  weighTimer = setInterval(() => {
    // 以上下限中点为中心做正弦摆动，振幅略大于半区间，
    // 使实时重量在范围内（绿色）与范围外（红色）之间来回徘徊
    const center = (upperLimit.value + lowerLimit.value) / 2;
    const half = (upperLimit.value - lowerLimit.value) / 2;
    const amplitude = half * 1.8; // 大于 half，保证会越过上下限
    weighPhase += 0.35;
    const noise = Math.random() * 0.6 - 0.3;
    const next = center + amplitude * Math.sin(weighPhase) + noise;
    realWeight.value = Math.max(0, Math.min(maxScale.value, next));
  }, 200);
}

function stopWeighSim() {
  if (weighTimer) {
    clearInterval(weighTimer);
    weighTimer = null;
  }
}

// 模拟扫码：标签ID 录入后带出品号 / 名称 / 标准重量 / 上下限
function onScanLabel() {
  const m = selectedMaterial.value;
  if (m) {
    itemCode.value = m.materialCode;
    materialName.value = m.materialName;
    standardWeight.value = m.standardWeight;
  } else {
    itemCode.value = `P-${Math.floor(Math.random() * 9000 + 1000)}`;
    materialName.value = `原料${Math.floor(Math.random() * 90 + 10)}`;
    standardWeight.value = Math.floor(Math.random() * 30 + 20);
  }
  upperLimit.value = Number((standardWeight.value * 1.1).toFixed(1));
  lowerLimit.value = Number((standardWeight.value * 0.9).toFixed(1));
  realWeight.value = 0;
}

function selectBagWeight(w: number) {
  selectedBagWeight.value = w;
  bagWeight.value = w;
}

function openWeigh() {
  if (!selectedMaterial.value) {
    message.warning($t('dosingWeigh.plsSelectMaterial'));
    return;
  }
  // 打开时默认带出所选原料信息并模拟一个标签ID
  onScanLabel();
  labelId.value = `L-${Date.now()}`;
  weighOpen.value = true;
}

watch(weighOpen, (val) => {
  if (val) {
    nextTick(() => labelIdRef.value?.focus());
    startWeighSim();
  } else {
    stopWeighSim();
  }
});
// endregion

// region 下方右：称重信息
const weighData = ref<any[]>([]);

const weighGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'seq', width: 50, title: '#' },
    { field: 'trayId', title: $t('dosingWeigh.trayId'), minWidth: 130 },
    { field: 'labelId', title: $t('dosingWeigh.labelId'), minWidth: 130 },
    { field: 'materialNo', title: $t('dosingWeigh.materialNo'), minWidth: 120 },
    {
      field: 'materialName',
      title: $t('dosingWeigh.materialRealName'),
      minWidth: 130,
    },
    { field: 'weight', title: $t('dosingWeigh.weight'), minWidth: 110 },
  ],
  data: weighData.value,
  height: 320,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [WeighGrid, weighGridApi] = useVbenVxeGrid({
  gridOptions: weighGridOptions,
});

// 称重完成后（抽屉关闭）自动保存一条称重记录到右侧称重信息
function handleWeighClose() {
  weighOpen.value = false;
  if (!selectedMaterial.value) return;
  const m = selectedMaterial.value;
  const finalWeight = realWeight.value || m.standardWeight;
  weighData.value.push({
    trayId: `T-${m.materialCode}-${String(weighData.value.length + 1).padStart(3, '0')}`,
    labelId:
      labelId.value ||
      `L-${m.materialCode}-${String(weighData.value.length + 1).padStart(3, '0')}`,
    materialNo: m.materialCode,
    materialName: m.materialName,
    weight: finalWeight,
  });
  weighGridApi.grid.loadData([...weighData.value]);
  m.weighedWeight = finalWeight;
  materialGridApi.grid.loadData([...materialData.value]);
  message.success($t('dosingWeigh.weighed'));
  // 重置抽屉状态
  stopWeighSim();
  labelId.value = '';
  itemCode.value = '';
  materialName.value = '';
  bagWeight.value = 0;
  selectedBagWeight.value = null;
  weighMethods.value = [];
  realWeight.value = 0;
}
// endregion

// region 底部：连接设置 / 重打标签 / 标签打印
const printerOpen = ref(false);
const selectedPrinter = ref('');
const printerList = ['Printer-A', 'Printer-B', 'Printer-C'];

function openConnectionSetting() {
  printerOpen.value = true;
}

function handlePrinterOk() {
  printerOpen.value = false;
  message.success($t('dosingWeigh.printerSelected'));
}

function handleReprint() {
  message.success($t('dosingWeigh.reprintLabel'));
}

function handleLabelPrint() {
  if (weighData.value.length === 0) {
    message.warning($t('dosingWeigh.plsSelectInstruction'));
    return;
  }
  message.success($t('dosingWeigh.labelPrint'));
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
      <div class="mb-2 font-bold">{{ $t('dosingWeigh.instructionInfo') }}</div>
      <Form layout="inline" class="mb-3 flex-wrap items-end gap-2">
        <Form.Item :label="$t('dosingWeigh.line')">
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="$t('dosingWeigh.linePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('dosingWeigh.productName')">
          <Input
            v-model:value="queryParams.productName"
            :placeholder="$t('dosingWeigh.productNamePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('dosingWeigh.produceDate')">
          <DatePicker
            v-model:value="queryParams.produceDate"
            value-format="YYYY-MM-DD"
            :placeholder="$t('dosingWeigh.datePlaceholder')"
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
      <!-- 左侧：原料清单 -->
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
        <div
          class="rounded-lg border border-border bg-card p-3 shadow-sm my-2"
        >
          <div class="mb-2 font-bold">{{ $t('dosingWeigh.materialList') }}</div>
          <MaterialGrid>
            <template #toolbar-tools>
              <Button class="mr-2" @click="openWeigh">
                {{ $t('dosingWeigh.weigh') }}
              </Button>
            </template>
          </MaterialGrid>
        </div>
      </Col>

      <!-- 右侧：称重信息 -->
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
        <div
          class="rounded-lg border border-border bg-card p-3 shadow-sm my-2"
        >
          <div class="mb-2 font-bold">{{ $t('dosingWeigh.weighInfo') }}</div>
          <WeighGrid>
            <template #toolbar-tools>
              <Button class="mr-2" @click="handleLabelPrint">
                {{ $t('dosingWeigh.labelPrint') }}
              </Button>
            </template>
          </WeighGrid>
        </div>
      </Col>
    </Row>

    <!-- 底部：连接设置 / 重打标签 -->
    <div class="flex justify-start gap-2">
      <Button @click="openConnectionSetting">
        {{ $t('dosingWeigh.connectionSetting') }}
      </Button>
      <Button @click="handleReprint">
        {{ $t('dosingWeigh.reprintLabel') }}
      </Button>
    </div>

    <!-- 称重抽屉（纵向布局：标签ID → 品号/名称/标准重量/纸袋重量 → 实时重量进度条 → 称重方式） -->
    <Drawer
      v-model:open="weighOpen"
      :title="$t('dosingWeigh.weigh')"
      placement="top"
      height="560"
      @close="handleWeighClose"
    >
      <div class="flex flex-col gap-4">
        <!-- 1. 标签ID（常态自动获得焦点） -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('dosingWeigh.labelId') }}
          </div>
          <div></div>
          <Input
            ref="labelIdRef"
            v-model:value="labelId"
            :placeholder="$t('dosingWeigh.labelId')"
            @press-enter="onScanLabel"
          />
        </div>

        <!-- 2. 品号 + 名称 + 标准重量 + 纸袋重量 -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('dosingWeigh.itemCode') }}
          </div>
          <Space wrap align="center">
            <Input
              v-model:value="itemCode"
              :placeholder="$t('dosingWeigh.itemCode')"
            />
            <span class="text-sm">{{ $t('dosingWeigh.materialName') }}：{{ materialName || '-' }}</span>
            <span
              class="rounded bg-primary px-2 py-1 text-base font-bold text-primary-foreground"
            >
              {{ $t('dosingWeigh.standardWeight') }}：{{ standardWeight }} KG
            </span>
            <span
              class="rounded bg-warning px-2 py-1 text-base font-bold text-warning-foreground"
            >
              {{ $t('dosingWeigh.bagWeight') }}：{{ bagWeight }} KG
            </span>
          </Space>
        </div>

        <!-- 3. 实时重量进度条（含上下限竖条，范围内绿色、范围外红色） -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('dosingWeigh.realWeight') }}
          </div>
          <div class="relative h-10 w-full overflow-hidden rounded bg-muted">
            <div
              class="absolute left-0 top-0 h-full transition-all"
              :class="inRange ? 'bg-success' : 'bg-destructive'"
              :style="{ width: `${fillPercent}%` }"
            ></div>
            <div
              class="absolute top-0 h-full w-0.5 bg-foreground"
              :style="{ left: `${lowerPercent}%` }"
            ></div>
            <div
              class="absolute top-0 h-full w-0.5 bg-foreground"
              :style="{ left: `${upperPercent}%` }"
            ></div>
            <div
              class="absolute inset-0 flex items-center justify-center text-sm font-bold"
            >
              {{ realWeight.toFixed(1) }} KG
            </div>
          </div>
          <div class="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{{ $t('dosingWeigh.lowerLimit') }}：{{ lowerLimit }}</span>
            <span>{{ $t('dosingWeigh.upperLimit') }}：{{ upperLimit }}</span>
          </div>
        </div>

        <!-- 4. 称重方式（多选：纸袋 / 称重） -->
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('dosingWeigh.weighMethod') }}
          </div>
          <Checkbox.Group v-model:value="weighMethods">
            <Checkbox value="paperBag">{{ $t('dosingWeigh.paperBag') }}</Checkbox>
            <Checkbox value="weigh">{{ $t('dosingWeigh.weigh') }}</Checkbox>
          </Checkbox.Group>
          <div
            v-if="weighMethods.includes('paperBag')"
            class="mt-2 flex items-center gap-2"
          >
            <span class="text-sm">{{ $t('dosingWeigh.bagWeight') }}：</span>
            <Space wrap>
              <Button
                v-for="w of bagWeightOptions"
                :key="w"
                :type="selectedBagWeight === w ? 'primary' : 'default'"
                @click="selectBagWeight(w)"
              >
                {{ w }}KG
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Drawer>

    <!-- 连接设置：选择打印机 -->
    <Modal
      v-model:open="printerOpen"
      :title="$t('dosingWeigh.connectionSetting')"
      @ok="handlePrinterOk"
    >
      <Space direction="vertical" class="w-full">
        <Button
          v-for="p in printerList"
          :key="p"
          :type="selectedPrinter === p ? 'primary' : 'default'"
          @click="selectedPrinter = p"
        >
          {{ p }}
        </Button>
      </Space>
    </Modal>
  </div>
</template>
