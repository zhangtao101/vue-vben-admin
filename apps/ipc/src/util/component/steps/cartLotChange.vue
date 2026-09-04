<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import {
  Button,
  Checkbox,
  Descriptions,
  DescriptionsItem,
  Input,
  message,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { queryCartList, queryLotDetail, saveCartLotChange } from '#/api';
import { $t } from '#/locales';

/**
 * 台车LOT变更 (type=118)
 * 工序步骤组件标准入参
 */
defineProps({
  functionId: { type: Number, default: 0 },
  workstationCode: { type: String, default: '' },
  /** 工序编号，由外部传入 */
  processCode: { type: String, default: '' },
});

// region 1. 查询条件：LOTID / 台车代码
const queryLotId = ref('');
const queryCartCode = ref('');
// endregion

// region 2. 详情信息（Descriptions，字段与 queryLotDetail 返回键对齐）
const detailInfo = reactive<any>({});

/** 清空接口带出的详情展示字段 */
function resetDetail() {
  [
    'workSheetCode',
    'cartCode',
    'lineCode',
    'lineName',
    'productCode',
    'productName',
    'lotId',
    'lotCreateTime',
    'validDate',
    'sapSeq',
    'number',
    'equipCode',
    'opUser',
  ].forEach((key: string) => {
    delete detailInfo[key];
  });
}
// endregion

// region 3. 目标台车查询条件（按台车代码过滤，接口仅传分页与 cartCode）
const targetCartCode = ref('');
// endregion

// region 4. 目标台车列表（单选，数据来自 queryCartList，字段与返回 results 对齐）
/**
 * 加载目标台车列表：仅携带分页信息与 cartCode 条件调用 queryCartList
 * @param param0 page 分页信息（由表格 proxy 提供）
 * @returns { total, items } 供表格渲染
 */
function queryCartPage({ page }: any) {
  const params: any = {
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  };
  const cartCode = String(targetCartCode.value ?? '').trim();
  if (cartCode) {
    params.cartCode = cartCode;
  }
  return queryCartList(params)
    .then((res: any) => {
      const { total = 0, results = [] } = res ?? {};
      return { total, items: results };
    })
    .catch(() => ({ total: 0, items: [] }));
}

const cartGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      field: 'cartCode',
      title: $t('cartLotChange.colCartCode'),
      minWidth: 120,
    },
    {
      field: 'cartName',
      title: $t('cartLotChange.colCartName'),
      minWidth: 120,
    },
    {
      field: 'catTypeName',
      title: $t('cartLotChange.colCartType'),
      minWidth: 110,
    },
    { field: 'lotId', title: $t('cartLotChange.colLotId'), minWidth: 200 },
    {
      field: 'maxLoadQuantity',
      title: $t('cartLotChange.colMaxLoadQty'),
      minWidth: 110,
    },
    { field: 'quantity', title: $t('cartLotChange.colQty'), minWidth: 90 },
    {
      field: 'loadFlag',
      title: $t('cartLotChange.colIsLoaded'),
      minWidth: 90,
      slots: { default: 'loadFlag' },
    },
  ],
  height: 300,
  pagerConfig: { enabled: true, pageSize: 20, pageSizes: [10, 20, 50, 100] },
  proxyConfig: {
    ajax: {
      query: queryCartPage,
    },
  },
  stripe: true,
  radioConfig: { highlight: true, trigger: 'row' },
};

const [CartGrid, cartGridApi] = useVbenVxeGrid({
  gridOptions: cartGridOptions,
});
// endregion

// region 5. 查询方法
/** 按 LOTID / 台车代码查询批次详情（cartCode 可选） */
function handleQueryDetail() {
  const params: any = {};
  const lotId = String(queryLotId.value ?? '').trim();
  const cartCode = String(queryCartCode.value ?? '').trim();
  if (lotId) {
    params.lotId = lotId;
  }
  if (cartCode) {
    params.cartCode = cartCode;
  }
  if (Object.keys(params).length === 0) {
    message.warning($t('cartLotChange.plsInput'));
    return;
  }
  queryLotDetail(params).then((data: any) => {
    resetDetail();
    // 以接口返回字段整体展开赋值，后台字段即展示字段
    Object.assign(detailInfo, data ?? {});
  });
}

/** 重置查询条件与详情信息 */
function handleReset() {
  queryLotId.value = '';
  queryCartCode.value = '';
  resetDetail();
}

/** 按目标台车编码查询台车列表（触发表格重新加载） */
function handleQueryCart() {
  cartGridApi.reload();
}
// endregion

// region 6. 保存
/** 台车LOT变更保存：将详情批次 LOT 转移到所选目标台车 */
function handleSave() {
  const selected = cartGridApi.grid.getRadioRecord();
  if (!selected) {
    message.warning($t('cartLotChange.plsSelect'));
    return;
  }
  const lotId = String(detailInfo.lotId ?? '').trim();
  if (!lotId) {
    message.warning($t('cartLotChange.plsQueryLot'));
    return;
  }
  saveCartLotChange({ cartCode: selected.cartCode, lotId }).then(() => {
    message.success($t('cartLotChange.saveSuccess'));
    // 重新加载上方详情信息（原 LOT 绑定关系已变化）
    handleQueryDetail();
    // 刷新目标台车列表（装载状态、LOT 归属已变化）
    cartGridApi.reload();
  });
}
// endregion

onMounted(() => {
  // 初始化：默认加载一次目标台车列表
  setTimeout(() => {
    handleQueryCart();
  }, 200);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-2">
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
      <Button @click="handleReset">
        {{ $t('common.reset') }}
      </Button>
    </div>

    <!-- 2. 详情信息 (Descriptions) -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('cartLotChange.detailInfo') }}</div>
      <Descriptions bordered :column="6">
        <DescriptionsItem :label="$t('cartLotChange.lotId')" :span="2">
          {{ detailInfo.lotId || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.sapSerialNo')" :span="2">
          {{ detailInfo.sapSeq || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.cartCode')" :span="2">
          {{ detailInfo.cartCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.productCode')" :span="2">
          {{ detailInfo.productCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.productName')" :span="2">
          {{ detailInfo.productName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.operator')" :span="2">
          {{ detailInfo.opUser || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.prodExpiryDate')" :span="2">
          {{
            detailInfo.lotCreateTime || detailInfo.validDate
              ? `${detailInfo.lotCreateTime || '-'} / ${detailInfo.validDate || '-'}`
              : '-'
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.lineName')" :span="2">
          {{ detailInfo.lineName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.qty')" :span="1">
          {{ detailInfo.number ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartLotChange.loader')" :span="1">
          {{ detailInfo.equipCode || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 3. 目标台车查询（按台车代码过滤） -->
    <div class="flex flex-wrap items-center gap-3">
      <span>{{ $t('cartLotChange.targetCart') }}</span>
      <Input
        v-model:value="targetCartCode"
        :placeholder="$t('cartLotChange.plsInput')"
        style="width: 220px"
        @press-enter="handleQueryCart"
      />
      <Button type="primary" @click="handleQueryCart">
        {{ $t('cartLotChange.query') }}
      </Button>
    </div>

    <!-- 4. 台车列表（单选） -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div class="mb-2 font-bold">{{ $t('cartLotChange.cartList') }}</div>
      <CartGrid>
        <template #loadFlag="{ row }">
          <Checkbox :checked="Number(row.loadFlag) === 1" />
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
