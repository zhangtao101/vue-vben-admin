<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import PackagingMaterialDrawer from '#/util/component/PackagingMaterialDrawer.vue';

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

// region 1.1 左侧：工单信息表单
const lineOptions = [
  { label: $t('packagingOperation.line1'), value: 'L01' },
  { label: $t('packagingOperation.line2'), value: 'L02' },
  { label: $t('packagingOperation.line3'), value: 'L03' },
];

const productOptions = [
  { label: $t('packagingOperation.productA'), value: 'P-001' },
  { label: $t('packagingOperation.productB'), value: 'P-002' },
  { label: $t('packagingOperation.productC'), value: 'P-003' },
];

const form = reactive<any>({
  lineCode: undefined,
  workSheetCode: '',
  productCode: undefined,
  operator: '',
  workOrderRemark: '',
});
// endregion

// region 1.1 指标数（标题在上、数字在下）
const metrics = reactive<any>({
  instructionQty: 120,
  productionQty: 85,
  cartQty: 60,
});

const metricItems = [
  { key: 'instructionQty', title: $t('packagingOperation.instructionQty') },
  { key: 'productionQty', title: $t('packagingOperation.productionQty') },
  { key: 'cartQty', title: $t('packagingOperation.cartQty') },
];
// endregion

// region 1.2 右侧：投入材料（表格）+ 零点/重量控制
const materialData = ref<any[]>([
  {
    materialProductName: $t('packagingOperation.productA'),
    materialProductCode: 'P-001',
  },
  {
    materialProductName: $t('packagingOperation.productB'),
    materialProductCode: 'P-002',
  },
]);

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialProductName',
      title: $t('packagingOperation.materialProductName'),
      minWidth: 160,
    },
    {
      field: 'materialProductCode',
      title: $t('packagingOperation.materialProductCode'),
      minWidth: 160,
    },
  ],
  data: materialData.value,
  height: 200,
  stripe: true,
};

const [MaterialGrid] = useVbenVxeGrid({ gridOptions: materialGridOptions });

const zeroOn = ref<boolean>(false);
const weight = ref<number | undefined>(undefined);
const smallValue = ref<number | undefined>(undefined);

function handleZeroChange(val: any) {
  message.success(
    val ? $t('packagingOperation.zeroOn') : $t('packagingOperation.zeroOff'),
  );
}
// endregion

// region 2. 推车列表表格（含 toolbar-actions / toolbar-tools 插槽，多选）
const toolbarQuery = reactive<any>({
  cartCode: '',
  qty: undefined,
});

const cartData = ref<any[]>([
  {
    lotId: 'LOT-001',
    cartCode: 'C-001',
    workOrder: 'WO-20260722-001',
    qty: 100,
    unit: 'pcs',
    status: 'loaded',
    loadTime: '2026-07-22 09:00:00',
    excludeTime: '',
  },
  {
    lotId: 'LOT-002',
    cartCode: 'C-002',
    workOrder: 'WO-20260722-001',
    qty: 120,
    unit: 'pcs',
    status: 'excluded',
    loadTime: '2026-07-22 10:00:00',
    excludeTime: '2026-07-22 11:30:00',
  },
]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'lotId', title: $t('packagingOperation.colLotId'), minWidth: 140 },
    {
      field: 'cartCode',
      title: $t('packagingOperation.colCartCode'),
      minWidth: 120,
    },
    {
      field: 'workOrder',
      title: $t('packagingOperation.colWorkOrder'),
      minWidth: 180,
    },
    { field: 'qty', title: $t('packagingOperation.colQty'), minWidth: 100 },
    { field: 'unit', title: $t('packagingOperation.colUnit'), minWidth: 80 },
    {
      field: 'status',
      title: $t('packagingOperation.colStatus'),
      minWidth: 120,
      formatter: ({ cellValue }) =>
        cellValue === 'loaded'
          ? $t('packagingOperation.statusLoaded')
          : $t('packagingOperation.statusExcluded'),
    },
    {
      field: 'loadTime',
      title: $t('packagingOperation.colLoadTime'),
      minWidth: 180,
    },
    {
      field: 'excludeTime',
      title: $t('packagingOperation.colExcludeTime'),
      minWidth: 180,
    },
  ],
  data: cartData.value,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function getSelectedRows(): any[] {
  return gridApi.grid.getCheckboxRecords();
}

function handleCartDelete() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  const codes = new Set(rows.map((r: any) => r.lotId));
  cartData.value = cartData.value.filter((r) => !codes.has(r.lotId));
  gridApi.grid.loadData([...cartData.value]);
  message.success($t('packagingOperation.cartDeleteSuccess'));
}

function handleLabelIssue() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  message.success($t('packagingOperation.labelIssueSuccess'));
}

function handlePerformanceCancel() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  message.success($t('packagingOperation.performanceCancelSuccess'));
}

function handlePerformanceRegister() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning($t('packagingOperation.plsSelectRow'));
    return;
  }
  message.success($t('packagingOperation.performanceRegisterSuccess'));
}
// endregion

// region 3. 底部：连接设置（预留）/ 按钮：材料装载 / 开始 / 结束
const connectModalVisible = ref(false);
const selectedPrinter = ref<string | undefined>(undefined);

function openConnectModal() {
  connectModalVisible.value = true;
}

function handleConnectOk() {
  connectModalVisible.value = false;
}

function handleConnectCancel() {
  connectModalVisible.value = false;
}

const workStatus = ref<'idle' | 'running'>('idle');

const materialDrawerRef = ref<any>();

function handleMaterialLoad() {
  materialDrawerRef.value?.open(form);
}

function handleStart() {
  if (workStatus.value === 'running') {
    message.warning($t('packagingOperation.alreadyRunning'));
    return;
  }
  workStatus.value = 'running';
  message.success($t('packagingOperation.startSuccess'));
}

function handleEnd() {
  if (workStatus.value === 'idle') {
    message.warning($t('packagingOperation.notStarted'));
    return;
  }
  workStatus.value = 'idle';
  message.success($t('packagingOperation.endSuccess'));
}
// endregion

onMounted(() => {
  gridApi.grid.loadData([...cartData.value]);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('packagingOperation.title') }}</div>

    <!-- 1. 上方左右两栏 -->
    <Row :gutter="16">
      <!-- 1.1 左侧：工单信息 + 指标 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-3 font-bold">
            {{ $t('packagingOperation.formTitle') }}
          </div>
          <Form
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :model="form"
          >
            <Form.Item :label="$t('packagingOperation.line')">
              <Select
                v-model:value="form.lineCode"
                :options="lineOptions"
                :placeholder="$t('packagingOperation.linePlaceholder')"
                allow-clear
              />
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.workOrder')">
              <Input
                v-model:value="form.workSheetCode"
                :placeholder="$t('packagingOperation.workOrderPlaceholder')"
                allow-clear
              />
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.product')">
              <Select
                v-model:value="form.productCode"
                :options="productOptions"
                :placeholder="$t('packagingOperation.productPlaceholder')"
                allow-clear
              />
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.operator')">
              <Input
                v-model:value="form.operator"
                :placeholder="$t('packagingOperation.operatorPlaceholder')"
                allow-clear
              />
            </Form.Item>
            <Form.Item :label="$t('packagingOperation.workOrderRemark')">
              <Input.Textarea
                v-model:value="form.workOrderRemark"
                :placeholder="$t('packagingOperation.remarkPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Form>

          <!-- 指标数：标题在上、数字在下 -->
          <div class="mt-3 rounded-md border border-border bg-muted/40 p-3">
            <div class="mb-2 font-bold">
              {{ $t('packagingOperation.metrics') }}
            </div>
            <Row :gutter="12">
              <Col
                v-for="item in metricItems"
                :key="item.key"
                :xs="8"
                class="mb-2"
              >
                <div
                  class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-card py-3"
                >
                  <div class="text-sm text-muted-foreground">
                    {{ item.title }}
                  </div>
                  <div class="mt-1 text-2xl font-bold text-primary">
                    {{ metrics[item.key] }}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Col>

      <!-- 1.2 右侧：投入材料 + 零点/重量控制 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-3 font-bold">
            {{ $t('packagingOperation.materialTitle') }}
          </div>
          <MaterialGrid>
            <template #toolbar-tools></template>
          </MaterialGrid>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">
                {{ $t('packagingOperation.zeroSwitch') }}
              </span>
              <Switch :checked="zeroOn" @change="handleZeroChange" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">
                {{ $t('packagingOperation.weight') }}
              </span>
              <InputNumber
                v-model:value="weight"
                :placeholder="$t('packagingOperation.weightPlaceholder')"
                :min="0"
                class="w-36"
              />
              <InputNumber
                v-model:value="smallValue"
                :placeholder="$t('packagingOperation.smallValue')"
                :min="0"
                class="w-20"
              />
            </div>
          </div>
        </div>
      </Col>
    </Row>

    <!-- 2. 推车列表表格 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">
        {{ $t('packagingOperation.tableTitle') }}
      </div>
      <Grid>
        <template #toolbar-actions>
          <Input
            v-model:value="toolbarQuery.cartCode"
            :placeholder="$t('packagingOperation.cartCodePlaceholder')"
            allow-clear
            class="mr-2 w-40"
          />
          <InputNumber
            v-model:value="toolbarQuery.qty"
            :placeholder="$t('packagingOperation.qtyPlaceholder')"
            :min="0"
            class="w-32"
          />
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" @click="handleCartDelete">
            {{ $t('packagingOperation.cartDelete') }}
          </Button>
          <Button class="mr-2" @click="handleLabelIssue">
            {{ $t('packagingOperation.labelIssue') }}
          </Button>
          <Button class="mr-2" @click="handlePerformanceCancel">
            {{ $t('packagingOperation.performanceCancel') }}
          </Button>
          <Button type="primary" @click="handlePerformanceRegister">
            {{ $t('packagingOperation.performanceRegister') }}
          </Button>
        </template>
      </Grid>
    </div>

    <!-- 3. 底部：左连接设置（预留）/ 右按钮 -->
    <Row :gutter="16">
      <Col :xs="24" :lg="12">
        <Button @click="openConnectModal">
          {{ $t('packagingOperation.connectTitle') }}
        </Button>
      </Col>
      <Col
        :xs="24"
        :lg="12"
        class="flex items-end justify-end gap-2 text-right"
      >
        <Button @click="handleMaterialLoad">
          {{ $t('packagingOperation.materialLoad') }}
        </Button>
        <Button type="primary" @click="handleStart">
          {{ $t('packagingOperation.start') }}
        </Button>
        <Button type="primary" danger @click="handleEnd">
          {{ $t('packagingOperation.end') }}
        </Button>
      </Col>
    </Row>

    <!-- 连接设置模态框（打印机选择，功能预留） -->
    <Modal
      v-model:open="connectModalVisible"
      :title="$t('packagingOperation.connectTitle')"
      @ok="handleConnectOk"
      @cancel="handleConnectCancel"
    >
      <div class="text-xs text-muted-foreground mb-3">
        {{ $t('packagingOperation.connectDesc') }}
      </div>
      <Form layout="vertical">
        <Form.Item :label="$t('packagingOperation.printer')">
          <Select
            v-model:value="selectedPrinter"
            :placeholder="$t('packagingOperation.printerPlaceholder')"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 材料装载抽屉（公共组件） -->
    <PackagingMaterialDrawer ref="materialDrawerRef" />
  </div>
</template>
