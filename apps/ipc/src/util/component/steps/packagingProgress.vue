<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
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

// region 1. 工单信息表单（垂直堆叠）
const subLineOptions = [
  { label: $t('packagingProgress.subLine1'), value: 'S1' },
  { label: $t('packagingProgress.subLine2'), value: 'S2' },
  { label: $t('packagingProgress.subLine3'), value: 'S3' },
];

const lineOptions = [
  { label: $t('packagingProgress.line1'), value: 'L01' },
  { label: $t('packagingProgress.line2'), value: 'L02' },
  { label: $t('packagingProgress.line3'), value: 'L03' },
];

const productOptions = [
  { label: $t('packagingProgress.productA'), value: 'P-001' },
  { label: $t('packagingProgress.productB'), value: 'P-002' },
  { label: $t('packagingProgress.productC'), value: 'P-003' },
];

const form = reactive<any>({
  subLine: undefined,
  workOrder: '',
  product: undefined,
  line: undefined,
  workOrderRemark: '',
  printCode: '',
});
// endregion

// region 2. 指标数（标题在上、数字在下）
const metrics = reactive<any>({
  instructionQty: 120,
  productionQty: 85,
  stackQty: 60,
  subLineProductionQty: 85,
});

const metricItems = [
  { key: 'instructionQty', title: $t('packagingProgress.instructionQty') },
  { key: 'productionQty', title: $t('packagingProgress.productionQty') },
  { key: 'stackQty', title: $t('packagingProgress.stackQty') },
  {
    key: 'subLineProductionQty',
    title: $t('packagingProgress.subLineProductionQty'),
  },
];
// endregion

// region 3. 加载材料列表（假数据，接口就绪后替换为接口返回）
const fakeMaterials: any[] = [
  {
    materialName: $t('packagingProgress.matBox'),
    loadQty: 2000,
    unit: 'pcs',
    equipmentName: 'Packer-A',
  },
  {
    materialName: $t('packagingProgress.matFilm'),
    loadQty: 500,
    unit: 'roll',
    equipmentName: 'Wrapper-B',
  },
];

const materialData = ref<any[]>([]);

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      field: 'materialName',
      title: $t('packagingProgress.colMaterialName'),
      minWidth: 160,
    },
    { field: 'loadQty', title: $t('packagingProgress.colLoadQty'), minWidth: 120 },
    { field: 'unit', title: $t('packagingProgress.colUnit'), minWidth: 90 },
    {
      field: 'equipmentName',
      title: $t('packagingProgress.colEquipmentName'),
      minWidth: 160,
    },
  ],
  data: materialData.value,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function loadMaterials() {
  materialData.value = [...fakeMaterials];
  gridApi.grid.loadData([...materialData.value]);
}
// endregion

// endregion

// region 5. 按钮：材料加载 / 工作开始 / 工作结束
const workStatus = ref<'idle' | 'running'>('idle');

const materialDrawerRef = ref();

function handleMaterialLoad() {
  materialDrawerRef.value.open();
}

function handleWorkStart() {
  if (workStatus.value === 'running') {
    message.warning($t('packagingProgress.alreadyRunning'));
    return;
  }
  workStatus.value = 'running';
  message.success($t('packagingProgress.startSuccess'));
}

function handleWorkEnd() {
  if (workStatus.value === 'idle') {
    message.warning($t('packagingProgress.notStarted'));
    return;
  }
  workStatus.value = 'idle';
  message.success($t('packagingProgress.endSuccess'));
}
// endregion

onMounted(() => {
  loadMaterials();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('packagingProgress.title') }}</div>

    <!-- 1. 工单信息表单（垂直向下） -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('packagingProgress.formTitle') }}</div>
      <Form layout="vertical" :model="form">
        <Form.Item :label="$t('packagingProgress.subLine')">
          <Select
            v-model:value="form.subLine"
            :options="subLineOptions"
            :placeholder="$t('packagingProgress.subLinePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('packagingProgress.workOrder')">
          <Input
            v-model:value="form.workOrder"
            :placeholder="$t('packagingProgress.workOrderPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('packagingProgress.product')">
          <Select
            v-model:value="form.product"
            :options="productOptions"
            :placeholder="$t('packagingProgress.productPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('packagingProgress.line')">
          <Select
            v-model:value="form.line"
            :options="lineOptions"
            :placeholder="$t('packagingProgress.linePlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('packagingProgress.workOrderRemark')">
          <Input.Textarea
            v-model:value="form.workOrderRemark"
            :placeholder="$t('packagingProgress.remarkPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('packagingProgress.printCode')">
          <Input
            v-model:value="form.printCode"
            :placeholder="$t('packagingProgress.printCodePlaceholder')"
            allow-clear
          />
        </Form.Item>
      </Form>
    </div>

    <!-- 2. 指标数：标题在上、数字在下 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-3 font-bold">{{ $t('packagingProgress.metrics') }}</div>
      <Row :gutter="16">
        <Col
          v-for="item in metricItems"
          :key="item.key"
          :xs="12"
          :sm="12"
          :md="6"
          class="mb-3"
        >
          <div
            class="flex h-full flex-col items-center justify-center rounded-md border border-border bg-muted/40 py-4"
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

    <!-- 3. 加载材料列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('packagingProgress.materialList') }}</div>
      <Grid>
        <template #toolbar-tools></template>
      </Grid>
    </div>

    <!-- 4. 右对齐按钮 -->
    <div class="flex justify-end gap-2">
      <Button @click="handleMaterialLoad">
        {{ $t('packagingProgress.materialLoad') }}
      </Button>
      <Button type="primary" @click="handleWorkStart">
        {{ $t('packagingProgress.workStart') }}
      </Button>
      <Button type="primary" danger @click="handleWorkEnd">
        {{ $t('packagingProgress.workEnd') }}
      </Button>
    </div>

    <!-- 5. 包装材料加载/卸载抽屉（公共组件） -->
    <PackagingMaterialDrawer ref="materialDrawerRef" />
  </div>
</template>
