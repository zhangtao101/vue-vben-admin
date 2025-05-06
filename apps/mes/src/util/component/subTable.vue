<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

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
    { field: 'test', title: '项目', minWidth: 50 },
    {
      title: '期初',
      minWidth: 50,
      children: [
        { field: '1', title: '数量（T)', minWidth: 50 },
        { field: '2', title: '金额（元）', minWidth: 50 },
      ],
    },
    {
      title: '期末',
      minWidth: 50,
      children: [
        { field: '3', title: '数量（T)', minWidth: 50 },
        { field: '4', title: '金额（元）', minWidth: 50 },
      ],
    },
    {
      title: '本期产量',
      minWidth: 50,
      children: [
        { field: '5', title: '数量（T)', minWidth: 50 },
        { field: '6', title: '金额（元）', minWidth: 50 },
      ],
    },
    {
      title: '本期耗用',
      minWidth: 50,
      children: [
        { field: '7', title: '数量（T)', minWidth: 50 },
        { field: '8', title: '金额（元）', minWidth: 50 },
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
