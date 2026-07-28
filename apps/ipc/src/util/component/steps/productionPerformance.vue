<script setup lang="ts">
import { reactive } from 'vue';

import { Button, Col, Form, Input, message, Row, Space } from 'ant-design-vue';

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

// region 1. 查询条件
const queryForm = reactive<any>({
  workOrder: '',
});

function handleQuery() {
  // TODO: 接口就绪后替换为真实查询（按工单号带出生产列表与 LOT 列表）
}

function handleReset() {
  queryForm.workOrder = '';
}
// endregion

// region 2.1 左侧：生产列表（假数据，接口就绪后替换为接口返回）
const productionData = reactive<any[]>([
  {
    stackerId: 'S-01',
    materialProductCode: 'P-001',
    materialProductName: $t('productionPerformance.productA'),
    prodInstrSerial: 'SEQ-20260721-001',
  },
  {
    stackerId: 'S-02',
    materialProductCode: 'P-002',
    materialProductName: $t('productionPerformance.productB'),
    prodInstrSerial: 'SEQ-20260721-002',
  },
]);

const productionGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'stackerId', title: $t('productionPerformance.colStackerId'), minWidth: 120 },
    {
      field: 'materialProductCode',
      title: $t('productionPerformance.colMaterialProductCode'),
      minWidth: 160,
    },
    {
      field: 'materialProductName',
      title: $t('productionPerformance.colMaterialProductName'),
      minWidth: 160,
    },
    {
      field: 'prodInstrSerial',
      title: $t('productionPerformance.colProdInstrSerial'),
      minWidth: 180,
    },
  ],
  data: productionData,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [ProductionGrid, productionGridApi] = useVbenVxeGrid({
  gridOptions: productionGridOptions,
});
// endregion

// region 2.2 右侧：生产 LOT 列表（多选，假数据）
const lotData = reactive<any[]>([
  {
    lotId: 'LOT-001',
    qty: 100,
    unit: 'pcs',
    handleTime: '2026-07-21 09:00:00',
  },
  {
    lotId: 'LOT-002',
    qty: 120,
    unit: 'pcs',
    handleTime: '2026-07-21 10:30:00',
  },
]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'checkbox', width: 50, title: '' },
    { field: 'lotId', title: $t('productionPerformance.colLotId'), minWidth: 140 },
    { field: 'qty', title: $t('productionPerformance.colQty'), minWidth: 100 },
    { field: 'unit', title: $t('productionPerformance.colUnit'), minWidth: 80 },
    { field: 'handleTime', title: $t('productionPerformance.colHandleTime'), minWidth: 180 },
  ],
  data: lotData,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({ gridOptions: lotGridOptions });
// endregion

// region 3. 按钮：业绩生成 / 业绩取消
function getSelectedLots(): any[] {
  return lotGridApi.grid.getCheckboxRecords();
}

function handleGenPerformance() {
  const rows = getSelectedLots();
  if (rows.length === 0) {
    message.warning($t('productionPerformance.plsSelectLot'));
    return;
  }
  message.success($t('productionPerformance.genSuccess'));
}

function handleCancelPerformance() {
  const rows = getSelectedLots();
  if (rows.length === 0) {
    message.warning($t('productionPerformance.plsSelectLot'));
    return;
  }
  message.success($t('productionPerformance.cancelSuccess'));
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('productionPerformance.title') }}</div>

    <!-- 1. 查询条件 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Form layout="vertical" :model="queryForm">
        <Row :gutter="16">
          <Col :xs="24" :sm="12" :md="8" :lg="6">
            <Form.Item :label="$t('productionPerformance.workOrder')">
              <Input
                v-model:value="queryForm.workOrder"
                :placeholder="$t('productionPerformance.workOrderPlaceholder')"
                allow-clear
              />
            </Form.Item>
          </Col>
          <Col :xs="24" :sm="24" :md="24" :lg="6" class="flex items-end">
            <Space>
              <Button type="primary" @click="handleQuery">
                {{ $t('common.query') }}
              </Button>
              <Button @click="handleReset">{{ $t('common.reset') }}</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>

    <!-- 2. 左右两个区域 -->
    <Row :gutter="16">
      <!-- 2.1 左侧：生产列表 -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('productionPerformance.productionList') }}</div>
          <ProductionGrid>
            <template #toolbar-tools></template>
          </ProductionGrid>
        </div>
      </Col>
      <!-- 2.2 右侧：生产 LOT 列表（多选） -->
      <Col :xs="24" :lg="12">
        <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div class="mb-2 font-bold">{{ $t('productionPerformance.lotList') }}</div>
          <LotGrid>
            <template #toolbar-tools></template>
          </LotGrid>
        </div>
      </Col>
    </Row>

    <!-- 3. 按钮：业绩生成 / 业绩取消 -->
    <div class="flex justify-end gap-2">
      <Button type="primary" @click="handleGenPerformance">
        {{ $t('productionPerformance.genPerformance') }}
      </Button>
      <Button danger @click="handleCancelPerformance">
        {{ $t('productionPerformance.cancelPerformance') }}
      </Button>
    </div>
  </div>
</template>
