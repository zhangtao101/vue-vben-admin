<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Input,
  message,
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { $t } from '#/locales';

/**
 * 台车LOT变更 (type=118)
 * 工序步骤组件标准入参
 */
defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
});

// region 1. 查询条件：LOTID / 台车代码
const queryLotId = ref('');
const queryCartCode = ref('');
// endregion

// region 2. 详情信息（Descriptions）
const detailInfo = reactive<any>({
  lotId: '',
  sapSerialNo: '',
  cartCode: '',
  productCode: '',
  productName: '',
  operator: '',
  productionDate: '',
  expiryDate: '',
  lineName: '',
  qty: 0,
  loader: '',
});
// endregion

// region 3. 装载目标台车
const targetCart = ref('');
const targetCartOptions = reactive<any[]>([]);
// endregion

// region 4. 台车列表（单选）
const cartListData = reactive<any[]>([]);

const cartGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'cartCode', title: $t('cartLotChange.colCartCode'), minWidth: 120 },
    { field: 'cartName', title: $t('cartLotChange.colCartName'), minWidth: 120 },
    { field: 'cartType', title: $t('cartLotChange.colCartType'), minWidth: 110 },
    {
      field: 'isLoaded',
      title: $t('cartLotChange.colIsLoaded'),
      minWidth: 100,
      slots: { default: 'isLoaded' },
    },
    { field: 'lotId', title: $t('cartLotChange.colLotId'), minWidth: 140 },
    { field: 'qty', title: $t('cartLotChange.colQty'), minWidth: 90 },
  ],
  data: cartListData,
  height: 360,
  stripe: true,
  radioConfig: { trigger: 'row' },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [CartGrid, cartGridApi] = useVbenVxeGrid({ gridOptions: cartGridOptions });
// endregion

// region 5. 查询方法
function handleQueryDetail() {
  // TODO: 接口就绪后替换为真实查询（按LOTID与台车代码查询详情）
  detailInfo.lotId = queryLotId.value || '-';
  detailInfo.sapSerialNo = '-';
  detailInfo.cartCode = queryCartCode.value || '-';
  detailInfo.productCode = '-';
  detailInfo.productName = '-';
  detailInfo.operator = '-';
  detailInfo.productionDate = '-';
  detailInfo.expiryDate = '-';
  detailInfo.lineName = '-';
  detailInfo.qty = 0;
  detailInfo.loader = '-';
}

function handleQueryTargetCart() {
  // TODO: 接口就绪后替换为真实查询（按装载目标台车查询可选台车列表）
  cartListData.length = 0;
  cartListData.push(
    {
      cartCode: 'CART-001',
      cartName: '台车A',
      cartType: '标准型',
      isLoaded: true,
      lotId: 'LOT-001',
      qty: 100,
    },
    {
      cartCode: 'CART-002',
      cartName: '台车B',
      cartType: '标准型',
      isLoaded: false,
      lotId: '',
      qty: 0,
    },
    {
      cartCode: 'CART-003',
      cartName: '台车C',
      cartType: '重型',
      isLoaded: true,
      lotId: 'LOT-003',
      qty: 200,
    },
  );
  cartGridApi.reload();
}
// endregion

// region 6. 保存
function handleSave() {
  const selected = cartGridApi.getRadioRecord();
  if (!selected) {
    message.warning($t('cartLotChange.plsSelect'));
    return;
  }
  // TODO: 接口就绪后替换为真实保存
  message.success($t('cartLotChange.saveSuccess'));
}
// endregion

onMounted(() => {
  // 初始化
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('cartLotChange.title') }}</div>

    <!-- 1. 查询条件：LOTID / 台车代码 -->
    <div class="flex flex-wrap items-center gap-3">
      <span>{{ $t('cartLotChange.lotId') }}</span>
      <Input
        v-model:value="queryLotId"
        :placeholder="$t('cartLotChange.plsInput')"
        style="width: 180px"
      />
      <span>{{ $t('cartLotChange.cartCode') }}</span>
      <Input
        v-model:value="queryCartCode"
        :placeholder="$t('cartLotChange.plsInput')"
        style="width: 180px"
      />
      <Button type="primary" @click="handleQueryDetail">
        {{ $t('cartLotChange.query') }}
      </Button>
    </div>

    <!-- 2. 详情信息 (Descriptions) -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('cartLotChange.detailInfo') }}</div>
      <Descriptions bordered :column="4">
        <DescriptionsItem :label="$t('cartLotChange.lotId')">
          {{ detailInfo.lotId || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.sapSerialNo')">
          {{ detailInfo.sapSerialNo || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.cartCode')">
          {{ detailInfo.cartCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.productCode')">
          {{ detailInfo.productCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.productName')">
          {{ detailInfo.productName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.operator')">
          {{ detailInfo.operator || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.productionDate')">
          {{ detailInfo.productionDate || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.expiryDate')">
          {{ detailInfo.expiryDate || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.lineName')">
          {{ detailInfo.lineName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.qty')">
          {{ detailInfo.qty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.loader')">
          {{ detailInfo.loader || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 3. 装载目标台车查询 -->
    <div class="flex flex-wrap items-center gap-3">
      <span>{{ $t('cartLotChange.targetCart') }}</span>
      <Select
        v-model:value="targetCart"
        show-search
        :placeholder="$t('cartLotChange.plsSelect')"
        :options="targetCartOptions"
        style="width: 220px"
      />
      <Button type="primary" @click="handleQueryTargetCart">
        {{ $t('cartLotChange.query') }}
      </Button>
    </div>

    <!-- 4. 台车列表（单选） -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('cartLotChange.cartList') }}</div>
      <CartGrid>
        <template #toolbar-tools></template>
        <template #isLoaded="{ row }">
          <span>{{ row.isLoaded ? $t('cartLotChange.yes') : $t('cartLotChange.no') }}</span>
        </template>
      </CartGrid>
    </div>

    <!-- 5. 保存按钮 -->
    <div class="flex justify-end">
      <Button type="primary" @click="handleSave">
        {{ $t('cartLotChange.save') }}
      </Button>
    </div>
  </div>
</template>
