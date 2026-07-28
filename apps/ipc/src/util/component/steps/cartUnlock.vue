<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import { Button, Descriptions, DescriptionsItem, message } from 'ant-design-vue';

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
  currentLoadQty: 0,
  maxLoadQty: 0,
  lockStatus: '',
  isDeleted: '',
  lockCode: '',
  unlockCode: '',
});
// endregion

// region 2. 查询与解锁
function handleQuery() {
  // TODO: 接口就绪后替换为真实查询（按台车代码带出台车信息与锁定/解锁代码）
  // const params: any = {
  //   workstationCode: props.workstationCode,
  //   functionId: props.functionId,
  //   bindingId: props.bindingId,
  //   worksheetCode: props.worksheetCode,
  //   equipCode: props.equipCode,
  // };
  // fetchCartInfo(params).then((res) => { ... });
}

function handleUnlock() {
  message.success($t('cartUnlock.unlockSuccess'));
}
// endregion

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="text-lg font-bold">{{ $t('cartUnlock.title') }}</div>

    <!-- 1. 台车信息 -->
    <div class="rounded-lg border border-border bg-card p-3 shadow-sm">
      <Descriptions bordered :column="3">
        <DescriptionsItem :label="$t('cartUnlock.cartCode')">
          {{ cartInfo.cartCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.cartName')">
          {{ cartInfo.cartName || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.cartStatus')">
          {{ cartInfo.cartStatus || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.currentLoadQty')">
          {{ cartInfo.currentLoadQty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.maxLoadQty')">
          {{ cartInfo.maxLoadQty ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.lockStatus')">
          {{ cartInfo.lockStatus || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.isDeleted')">
          {{ cartInfo.isDeleted || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.lockCode')">
          {{ cartInfo.lockCode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('cartUnlock.unlockCode')">
          {{ cartInfo.unlockCode || '-' }}
        </DescriptionsItem>
      </Descriptions>
    </div>

    <!-- 2. 解锁按钮 -->
    <div class="flex justify-end">
      <Button type="primary" @click="handleUnlock">
        {{ $t('cartUnlock.unlock') }}
      </Button>
    </div>
  </div>
</template>
