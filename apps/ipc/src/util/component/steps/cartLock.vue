<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
  Button,
  Checkbox,
  Descriptions,
  DescriptionsItem,
  message,
  Modal,
  Select,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { lockOrUnlockCart, queryCartLoadingList } from '#/api';
import { $t } from '#/locales';

/**
 * 工序步骤组件标准入参（与作业平台其它 steps 组件保持一致）
 */
const props = defineProps({
  functionId: { type: Number, default: 0 },
  bindingId: { type: Number, default: 0 },
  worksheetCode: { type: String, default: '' },
  equipCode: { type: String, default: '' },
  workstationCode: { type: String, default: '' },
  /** 当前操作台车行数据，用于抽屉内回显（如由台车标签发行页传入） */
  cartRow: { type: Object, default: null },
  /** 操作模式：lock 锁定 / unlock 解锁 */
  mode: { type: String, default: 'lock' },
});

/** 操作成功事件：锁定/解锁成功后通知父级关闭抽屉并刷新列表 */
const emit = defineEmits<{ success: [] }>();

// region 1. 台车信息（直接承载外部传入的行数据，字段与 queryCartList 返回行保持一致）
const cartInfo = reactive<any>({});

/** 行数据回显：外部传入当前台车行时，整行展开铺入 cartInfo（不另起字段别名） */
function fillCartInfoByRow(row: any) {
  if (!row) return;
  Object.assign(cartInfo, { ...row });
}

/** 是否为解锁模式：lock 可选清洗中/维修，unlock 可选清洗结束/维修结束 */
const isUnlock = computed(() => props.mode === 'unlock');

/** 锁定代码选项：锁定模式仅 CLEANING/REPAIR，解锁模式仅 CLEAN END/REPAIR END */
const lockCodeOptions = computed(() =>
  isUnlock.value
    ? [
        { label: $t('cartLock.lockCleanEnd'), value: 'CLEAN END' },
        { label: $t('cartLock.lockRepairEnd'), value: 'REPAIR END' },
      ]
    : [
        { label: $t('cartLock.lockCleaning'), value: 'CLEANING' },
        { label: $t('cartLock.lockRepair'), value: 'REPAIR' },
      ],
);

/** 锁定状态编码 → 多语言文本：空值表示未锁定 */
function getLockStatusText(lockFlag: null | string | undefined) {
  const lockStatusMap: Record<string, string> = {
    CLEANING: `${$t('cartLock.lockCleaning')}(${lockFlag})`,
    REPAIR: `${$t('cartLock.lockRepair')}(${lockFlag})`,
    'CLEAN END': `${$t('cartLock.lockCleanEnd')}(${lockFlag})`,
    'REPAIR END': `${$t('cartLock.lockRepairEnd')}(${lockFlag})`,
  };
  return lockFlag
    ? (lockStatusMap[lockFlag] ?? lockFlag)
    : $t('cartLock.lockNone');
}
// endregion

// region 2. 已装载 LOT 列表（数据来自后台 queryCartLoadingList 接口）
/**
 * 加载已装载 LOT 列表：按台车代码查询（接口返回数组，不分页）
 * @returns { total, items } 供表格渲染
 */
function loadLotList() {
  if (!cartInfo.cartCode) {
    return Promise.resolve({ total: 0, items: [] });
  }
  return queryCartLoadingList({ cartCode: cartInfo.cartCode })
    .then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      return { total: list.length, items: list };
    })
    .catch(() => ({ total: 0, items: [] }));
}

const lotGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'lotId', title: $t('cartLock.colLotId'), minWidth: 160 },
    {
      field: 'workSheetCode',
      title: $t('cartLock.colWorkSheetCode'),
      minWidth: 140,
    },
    {
      field: 'productCode',
      title: $t('cartLock.colProductCode'),
      minWidth: 120,
    },
    {
      field: 'productName',
      title: $t('cartLock.colProductName'),
      minWidth: 140,
    },
    { field: 'quantity', title: $t('cartLock.colQuantity'), minWidth: 90 },
    { field: 'unit', title: $t('cartLock.colUnit'), minWidth: 80 },
    { field: 'lineCode', title: $t('cartLock.colLineCode'), minWidth: 110 },
    { field: 'lineName', title: $t('cartLock.colLineName'), minWidth: 120 },
    {
      field: 'state',
      title: $t('cartLock.colState'),
      minWidth: 100,
      slots: { default: 'state' },
    },
  ],
  height: 360,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: loadLotList,
    },
  },
  stripe: true,
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [LotGrid, lotGridApi] = useVbenVxeGrid({ gridOptions: lotGridOptions });
// endregion

// region 3. 行回显联动：台车变化后重新加载已装载 LOT 列表
watch(
  () => props.cartRow,
  (row: any) => {
    fillCartInfoByRow(row);
    setTimeout(() => {
      lotGridApi.reload();
    }, 200);
  },
  { immediate: true },
);

/** 模式切换时清空已选锁定代码，避免残留上一个模式的值 */
watch(
  () => props.mode,
  () => {
    cartInfo.lockCode = '';
  },
);
// endregion

// region 4. 锁定 / 解锁
/**
 * 锁定/解锁台车：校验后二次确认，确认后调用锁定/解锁接口（模式由 props.mode 区分）
 */
function handleLockOrUnlock() {
  if (!cartInfo.cartCode) {
    message.warning($t('cartLock.plsSelectCart'));
    return;
  }
  if (!cartInfo.lockCode) {
    message.warning($t('cartLock.plsSelect'));
    return;
  }
  Modal.confirm({
    title: isUnlock.value
      ? $t('cartLock.unlockConfirmTitle')
      : $t('cartLock.lockConfirmTitle'),
    content: isUnlock.value
      ? $t('cartLock.unlockConfirmContent')
      : $t('cartLock.lockConfirmContent'),
    okText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    onOk: () =>
      lockOrUnlockCart({
        cartCode: cartInfo.cartCode,
        lockCode: cartInfo.lockCode,
      }).then(() => {
        message.success(
          isUnlock.value
            ? $t('cartLock.unlockSuccess')
            : $t('cartLock.lockSuccess'),
        );
        emit('success');
      }),
  });
}
// endregion
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- 1. 台车信息 -->
    <Descriptions bordered :column="2">
      <DescriptionsItem :label="$t('cartLock.cartCode')" :span="2">
        {{ cartInfo.cartCode || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.cartName')">
        {{ cartInfo.cartName || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.cartStatus')">
        {{
          cartInfo.stateName ? `${cartInfo.stateName}(${cartInfo.state})` : '-'
        }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.currentLoadQty')">
        {{ cartInfo.quantity ?? '0' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.maxLoadQty')">
        {{ cartInfo.maxLoadQuantity ?? '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.lockStatus')">
        <Tag :color="cartInfo.lockFlag ? 'warning' : 'default'">
          {{ getLockStatusText(cartInfo.lockFlag) }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.isDeleted')">
        <Checkbox :checked="Number(cartInfo.deleteFlag) === 1" />
      </DescriptionsItem>
      <DescriptionsItem :label="$t('cartLock.lockCode')" :span="2">
        <Select
          v-model:value="cartInfo.lockCode"
          :options="lockCodeOptions"
          :placeholder="$t('cartLock.plsSelect')"
          allow-clear
          style="width: 100%"
        />
      </DescriptionsItem>
    </Descriptions>

    <!-- 2. 已装载 LOT 列表 -->
    <div
      class="rounded-lg border border-border bg-card p-3 shadow-sm"
      v-if="!isUnlock"
    >
      <div class="mb-2 font-bold">{{ $t('cartLock.lotList') }}</div>
      <LotGrid>
        <template #toolbar-tools></template>
        <template #state="{ row }">
          <Tag :color="Number(row.state) === 1 ? 'success' : 'default'">
            {{
              Number(row.state) === 1
                ? $t('cartLock.stateProducing')
                : $t('cartLock.stateWait')
            }}
          </Tag>
        </template>
      </LotGrid>
    </div>

    <!-- 3. 锁定/解锁按钮 -->
    <div class="flex justify-end">
      <Button type="primary" size="large" @click="handleLockOrUnlock">
        {{ isUnlock ? $t('cartLock.unlock') : $t('cartLock.lock') }}
      </Button>
    </div>
  </div>
</template>
