<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { Card } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// 接收开批日期
const props = defineProps<{
  openDate?: string;
}>();

// 定义列配置
const columns = ref([
  {
    field: 'groupOrMachine',
    title: $t('basic.capacityDetail.groupOrMachine'),
    minWidth: 150,
  },
  {
    field: 'category',
    title: $t('basic.capacityDetail.category'),
    minWidth: 100,
  },
  { field: 'today', title: $t('basic.capacityDetail.today'), minWidth: 100 },
  {
    field: 'selectedDate',
    title: $t('basic.capacityDetail.selectedDate'),
    minWidth: 120,
  },
  {
    field: 'totalCapacity',
    title: $t('basic.capacityDetail.totalCapacity'),
    minWidth: 120,
  },
]);

// 监听openDate变化,更新列标题
watch(
  () => props.openDate,
  (newDate) => {
    if (columns.value[3]) {
      columns.value[3].title =
        newDate || $t('basic.capacityDetail.selectedDate');
    }
  },
  { immediate: true },
);

/**
 * 加载表格数据
 */
function handleTableQuery(_params: any) {
  return new Promise((resolve) => {
    // TODO: 调用实际接口
    // const params = {
    //   page,
    //   pageSize,
    // };
    // return capacityDetailApi.getCapacityDetail(params)
    //   .then(({ total, list }) => {
    //     resolve({ total, items: list });
    //   });

    // 模拟数据
    setTimeout(() => {
      const mockData: any[] = [
        {
          groupOrMachine: '小组1',
          category: 'SMT',
          today: 800,
          selectedDate: 750,
          totalCapacity: 1550,
        },
        {
          groupOrMachine: '小组1',
          category: '组装',
          today: 600,
          selectedDate: 580,
          totalCapacity: 1180,
        },
        {
          groupOrMachine: '小组2',
          category: 'SMT',
          today: 700,
          selectedDate: 720,
          totalCapacity: 1420,
        },
        {
          groupOrMachine: '小组2',
          category: '组装',
          today: 500,
          selectedDate: 490,
          totalCapacity: 990,
        },
        {
          groupOrMachine: '机台A1',
          category: 'SMT',
          today: 400,
          selectedDate: 380,
          totalCapacity: 780,
        },
      ];

      resolve({
        total: mockData.length,
        items: mockData,
      });
    }, 300);
  });
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: columns.value,
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await handleTableQuery({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    refresh: true,
    zoom: true,
    custom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

defineExpose({
  reload: () => gridApi.reload(),
});
</script>

<template>
  <Card :title="$t('basic.capacityDetail.title')">
    <Grid />
  </Card>
</template>

<style scoped></style>
