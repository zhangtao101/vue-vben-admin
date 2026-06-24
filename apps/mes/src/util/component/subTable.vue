<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});
// region 子表格操作

const subTableConfiguration: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { field: 'test', title: $t('component.project'), minWidth: 50 },
    {
      title: $t('component.opening'),
      minWidth: 50,
      children: [
        { field: '1', title: $t('component.quantityTons'), minWidth: 50 },
        { field: '2', title: $t('component.amountYuan'), minWidth: 50 },
      ],
    },
    {
      title: $t('component.closing'),
      minWidth: 50,
      children: [
        { field: '3', title: $t('component.quantityTons'), minWidth: 50 },
        { field: '4', title: $t('component.amountYuan'), minWidth: 50 },
      ],
    },
    {
      title: $t('component.currentPeriodOutput'),
      minWidth: 50,
      children: [
        { field: '5', title: $t('component.quantityTons'), minWidth: 50 },
        { field: '6', title: $t('component.amountYuan'), minWidth: 50 },
      ],
    },
    {
      title: $t('component.currentPeriodConsumption'),
      minWidth: 50,
      children: [
        { field: '7', title: $t('component.quantityTons'), minWidth: 50 },
        { field: '8', title: $t('component.amountYuan'), minWidth: 50 },
      ],
    },
  ],
  data: props.data,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  pagerConfig: {
    enabled: false,
  },
};

const [SubTableGrid] = useVbenVxeGrid({
  gridOptions: subTableConfiguration,
});

// endregion
</script>

<template>
  <SubTableGrid />
</template>

<style scoped></style>
