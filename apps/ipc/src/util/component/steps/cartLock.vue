<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import { Button, Descriptions, DescriptionsItem, message } from 'ant-design-vue';

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

// region 1. 台车信息（Descriptions 展示，接口就绪后替换为接口返回）
const cartInfo = reactive<any>({
  cartCode: '',
  cartName: '',
  cartStatus: '',
  useStatus: '',
  currentLoadQty: 0,
  maxLoadQty: 0,
  lockStatus: '',
  isDeleted: '',
  lockCode: '',
});
// endregion

// region 2. 已装载 LOT 列表（假数据，接口就绪后替换为接口返回）
const lotData = reactive<any[]>([
  {
    lotId: 'LOT-001',
    qty: 100,
    unit: 'pcs',
    productCode: 'P-001',
    productName: '产品A',
    lineCode: 'L-01',
    lineName: '产线1',
    processCode: 'PR-01',
    processName: '工序1',
  },
  {
    lotId: 'LOT-002',
    qty: 120,
    unit: 'pcs',
    productCode: 'P-002',
    productName: '产品B',
    lineCode: 'L-01',
    lineName: '产线1',
    processCode: 'PR-02',
    processName: '工序2',
  },
]);

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'lotId', title: $t('cartLock.colLotId'), minWidth: 140 },
    { field: 'qty', title: $t('cartLock.colQty'), minWidth: 90 },
    { field: 'unit', title: $t('cartLock.colUnit'), minWidth: 80 },
    { field: 'productCode', title: $t('cartLock.colProductCode'), minWidth: 120 },
    { field: 'productName', title: $t('cartLock.colProductName'), minWidth: 140 },
    { field: 'lineCode', title: $t('cartLock.colLineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('cartLock.colLineName'), minWidth: 120 },
    { field: 'processCode', title: $t('cartLock.colProcessCode'), minWidth: 110 },
    { field: 'processName', title: $t('cartLock.colProcessName'), minWidth: 120 },
  ],
  data: lotData,
  height: 360,
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LotGrid] = useVbenVxeGrid({ gridOptions: lotGridOptions });
// endregion

// region 3. 查询与锁定
function handleQuery() {
  // TODO: 接口就绪后替换为真实查询（按台车代码带出台车信息与已装载 LOT 列表）
  // const params: any = {
  //   workstationCode: props.workstationCode,
  //   functionId: props.functionId,
  //   bindingId: props.bindingId,
  //   worksheetCode: props.worksheetCode,
  //   equipCode: props.equipCode,
  // };
  // fetchCartLock(params).then((res) => { ... });
}

function handleLock() {
  message.success($t('cartLock.lockSuccess'));
}
// endregion

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('cartLock.title') }}</div>

    <!-- 1. 台车信息 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Descriptions bordered :column="3">
        <DescriptionsItem :label="$t('cartLock.cartCode')">
          {{ cartInfo.cartCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.cartName')">
          {{ cartInfo.cartName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.cartStatus')">
          {{ cartInfo.cartStatus || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.useStatus')">
          {{ cartInfo.useStatus || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.currentLoadQty')">
          {{ cartInfo.currentLoadQty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.maxLoadQty')">
          {{ cartInfo.maxLoadQty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.lockStatus')">
          {{ cartInfo.lockStatus || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.isDeleted')">
          {{ cartInfo.isDeleted || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLock.lockCode')">
          {{ cartInfo.lockCode || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 2. 已装载 LOT 列表 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('cartLock.lotList') }}</div>
      <LotGrid>
        <template #toolbar-tools></template>
      </LotGrid>
    </div>

    <!-- 3. 锁定按钮 -->
    <div class="flex justify-end">
      <Button type="primary" @click="handleLock">
        {{ $t('cartLock.lock') }}
      </Button>
    </div>
  </div>
</template>
