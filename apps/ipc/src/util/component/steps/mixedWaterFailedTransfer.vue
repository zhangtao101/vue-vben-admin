<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Row,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { $t } from '#/locales';

defineOptions({ name: 'MixedWaterFailedTransfer' });

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

// 产线 key 联合类型，避免用 string 索引 Record 时得到 any[] | undefined
type LineKey = 'L1' | 'L2' | 'L3';

const { RangePicker } = DatePicker;

// region 查询条件
const queryParams = ref<any>({
  indicateDateRange: [],
  factory: 'F1',
  worksheetCode: '',
  materialProductCode: '',
  lineType: 'auto',
});

const factoryOptions = [
  { label: $t('mixedWaterFailedTransfer.factory1'), value: 'F1' },
  { label: $t('mixedWaterFailedTransfer.factory2'), value: 'F2' },
];

const lineTypeOptions = [
  { label: $t('mixedWaterFailedTransfer.autoLine'), value: 'auto' },
  { label: $t('mixedWaterFailedTransfer.manualLine'), value: 'manual' },
];
// endregion

// region 产线 tabs
const lineTabs = [
  { key: 'L1', label: $t('mixedWaterFailedTransfer.lineL1') },
  { key: 'L2', label: $t('mixedWaterFailedTransfer.lineL2') },
  { key: 'L3', label: $t('mixedWaterFailedTransfer.lineL3') },
];
const activeLine = ref<LineKey>('L1');

// 布局判断：xs/sm/md（< lg，约 < 992px）下列子列堆叠为上下排列，
// 此时“左移/右移”实际是“上移/下移”，箭头需切换为 ↓ / ↑
const isStacked = ref(false);
function updateLayout() {
  isStacked.value = window.innerWidth < 992;
}
// endregion

// region 假数据（接口就绪后替换为接口返回）
const masterData: Record<LineKey, any[]> = {
  L1: [
    {
      worksheetCode: 'WO-20260719-A01',
      priority: 1,
      materialProductCode: 'MP-001',
      materialProductName: '蛋白粉A',
    },
    {
      worksheetCode: 'WO-20260719-A02',
      priority: 2,
      materialProductCode: 'MP-002',
      materialProductName: '蛋白粉B',
    },
    {
      worksheetCode: 'WO-20260719-A03',
      priority: 1,
      materialProductCode: 'MP-003',
      materialProductName: '蛋白粉C',
    },
    {
      worksheetCode: 'WO-20260719-A04',
      priority: 3,
      materialProductCode: 'MP-004',
      materialProductName: '蛋白粉D',
    },
  ],
  L2: [
    {
      worksheetCode: 'WO-20260719-B01',
      priority: 2,
      materialProductCode: 'MP-011',
      materialProductName: '麦芽粉A',
    },
    {
      worksheetCode: 'WO-20260719-B02',
      priority: 1,
      materialProductCode: 'MP-012',
      materialProductName: '麦芽粉B',
    },
    {
      worksheetCode: 'WO-20260719-B03',
      priority: 3,
      materialProductCode: 'MP-013',
      materialProductName: '麦芽粉C',
    },
  ],
  L3: [
    {
      worksheetCode: 'WO-20260719-C01',
      priority: 1,
      materialProductCode: 'MP-021',
      materialProductName: '果糖A',
    },
    {
      worksheetCode: 'WO-20260719-C02',
      priority: 2,
      materialProductCode: 'MP-022',
      materialProductName: '果糖B',
    },
  ],
};
// 已选（右侧）数据，按产线分别保存
const rightStore: Record<LineKey, any[]> = { L1: [], L2: [], L3: [] };
// endregion

// region 左表：待传输列表
const leftGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'worksheetCode',
      title: $t('mixedWaterFailedTransfer.worksheetCode'),
      minWidth: 170,
    },
    {
      field: 'priority',
      title: $t('mixedWaterFailedTransfer.priority'),
      minWidth: 90,
    },
    {
      field: 'materialProductCode',
      title: $t('mixedWaterFailedTransfer.materialProductCode'),
      minWidth: 150,
    },
    {
      field: 'materialProductName',
      title: $t('mixedWaterFailedTransfer.materialProductName'),
      minWidth: 140,
    },
  ],
  data: [],
  height: 360,
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LeftGrid, leftGridApi] = useVbenVxeGrid({ gridOptions: leftGridOptions });
// endregion

// region 右表：已选列表（多出 顺序 字段）
const rightGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    {
      field: 'worksheetCode',
      title: $t('mixedWaterFailedTransfer.worksheetCode'),
      minWidth: 170,
    },
    { field: 'order', title: $t('mixedWaterFailedTransfer.order'), minWidth: 80 },
    {
      field: 'priority',
      title: $t('mixedWaterFailedTransfer.priority'),
      minWidth: 90,
    },
    {
      field: 'materialProductCode',
      title: $t('mixedWaterFailedTransfer.materialProductCode'),
      minWidth: 150,
    },
    {
      field: 'materialProductName',
      title: $t('mixedWaterFailedTransfer.materialProductName'),
      minWidth: 140,
    },
  ],
  data: [],
  height: 360,
  stripe: true,
  checkboxConfig: { highlight: true, range: true },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [RightGrid, rightGridApi] = useVbenVxeGrid({ gridOptions: rightGridOptions });
// endregion

// region 数据加载与转移
function matchQuery(item: any) {
  const { worksheetCode, materialProductCode } = queryParams.value;
  const m1 = !worksheetCode || item.worksheetCode.includes(worksheetCode);
  const m2 =
    !materialProductCode ||
    item.materialProductCode.includes(materialProductCode) ||
    item.materialProductName.includes(materialProductCode);
  return m1 && m2;
}

function renumber(line: LineKey) {
  rightStore[line].forEach((it, i) => (it.order = i + 1));
}

function loadLeft() {
  const line = activeLine.value;
  const rightKeys = new Set(rightStore[line].map((r) => r.worksheetCode));
  const list = masterData[line].filter(
    (item) => !rightKeys.has(item.worksheetCode) && matchQuery(item),
  );
  leftGridApi.grid.loadData([...list]);
}

function loadRight() {
  const line = activeLine.value;
  renumber(line);
  rightGridApi.grid.loadData([...rightStore[line]]);
}

// 切换产线 tab：重新加载左右两表
function handleTabChange() {
  loadLeft();
  loadRight();
}

function handleQuery() {
  loadLeft();
}

function handleReset() {
  queryParams.value = {
    indicateDateRange: [],
    factory: 'F1',
    worksheetCode: '',
    materialProductCode: '',
    lineType: 'auto',
  };
  loadLeft();
}

// 选中行从左侧移到右侧
function handleMoveRight() {
  const records: any[] = leftGridApi.grid.getCheckboxRecords() as any[];
  if (!records || records.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectLeft'));
    return;
  }
  const line = activeLine.value;
  records.forEach((r) => {
    rightStore[line].push({ ...r });
  });
  loadRight();
  loadLeft();
}

// 选中行从右侧移回左侧
function handleMoveLeft() {
  const records: any[] = rightGridApi.grid.getCheckboxRecords() as any[];
  if (!records || records.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  const line = activeLine.value;
  const removeSet = new Set(records.map((r) => r.worksheetCode));
  rightStore[line] = rightStore[line].filter((r) => !removeSet.has(r.worksheetCode));
  loadRight();
  loadLeft();
}

// 删除右侧选中行
function handleDelete() {
  const records: any[] = rightGridApi.grid.getCheckboxRecords() as any[];
  if (!records || records.length === 0) {
    message.warning($t('mixedWaterFailedTransfer.plsSelectRight'));
    return;
  }
  const line = activeLine.value;
  const removeSet = new Set(records.map((r) => r.worksheetCode));
  rightStore[line] = rightStore[line].filter((r) => !removeSet.has(r.worksheetCode));
  loadRight();
  message.success($t('mixedWaterFailedTransfer.deleteSuccess'));
}

function handleSave() {
  message.success($t('mixedWaterFailedTransfer.saveSuccess'));
}

function handleDeviceTransfer() {
  message.success($t('mixedWaterFailedTransfer.transferSuccess'));
}
// endregion

onMounted(() => {
  updateLayout();
  window.addEventListener('resize', updateLayout);
  loadLeft();
  loadRight();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="inline" class="flex-wrap items-end gap-2">
        <Form.Item :label="$t('mixedWaterFailedTransfer.indicateDate')">
          <RangePicker
            v-model:value="queryParams.indicateDateRange"
            value-format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.factory')">
          <Radio.Group
            v-model:value="queryParams.factory"
            :options="factoryOptions"
            option-type="button"
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.worksheetCode')">
          <Input
            v-model:value="queryParams.worksheetCode"
            :placeholder="$t('mixedWaterFailedTransfer.worksheetPlaceholder')"
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.materialProductCode')">
          <Input
            v-model:value="queryParams.materialProductCode"
            :placeholder="
              $t('mixedWaterFailedTransfer.materialProductCodePlaceholder')
            "
            allow-clear
          />
        </Form.Item>
        <Form.Item :label="$t('mixedWaterFailedTransfer.lineType')">
          <Radio.Group
            v-model:value="queryParams.lineType"
            :options="lineTypeOptions"
            option-type="button"
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
    </div>

    <!-- 产线 tabs + 左右转移区 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Tabs v-model:active-key="activeLine" @change="handleTabChange">
        <TabPane
          v-for="tab in lineTabs"
          :key="tab.key"
          :tab="tab.label"
        />
      </Tabs>

      <Row :gutter="16" class="items-stretch">
        <!-- 左：待传输列表 -->
        <Col :xs="24" :sm="24" :md="24" :lg="11" :xl="11">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.pendingList') }}
          </div>
          <LeftGrid>
            <template #toolbar-tools></template>
          </LeftGrid>
        </Col>

        <!-- 中：上下排列的左右箭头 -->
        <Col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="2"
          :xl="2"
          class="flex! justify-center"
          :class="{ 'flex-col ': !isStacked }"
        >
          <div class="flex items-center gap-3" :class="{ 'flex-col': !isStacked }">
            <Button
              shape="circle"
              type="primary"
              :title="$t('mixedWaterFailedTransfer.moveRight')"
              @click="handleMoveRight"
            >
              {{ isStacked ? '↓' : '→' }}
            </Button>
            <Button
              shape="circle"
              :title="$t('mixedWaterFailedTransfer.moveLeft')"
              @click="handleMoveLeft"
            >
              {{ isStacked ? '↑' : '←' }}
            </Button>
          </div>
        </Col>

        <!-- 右：已选列表 -->
        <Col :xs="24" :sm="24" :md="24" :lg="11" :xl="11">
          <div class="mb-2 font-bold">
            {{ $t('mixedWaterFailedTransfer.selectedList') }}
          </div>
          <RightGrid>
            <template #toolbar-tools></template>
          </RightGrid>
        </Col>
      </Row>

      <!-- 底部：删除 / 保存 / 设备传输，右对齐 -->
      <div class="mt-3 flex justify-end gap-2">
        <Button @click="handleDelete">
          {{ $t('mixedWaterFailedTransfer.delete') }}
        </Button>
        <Button @click="handleSave">
          {{ $t('mixedWaterFailedTransfer.save') }}
        </Button>
        <Button type="primary" @click="handleDeviceTransfer">
          {{ $t('mixedWaterFailedTransfer.deviceTransfer') }}
        </Button>
      </div>
    </div>
  </div>
</template>
