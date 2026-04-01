<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Card, Checkbox } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// 是否只显示不齐套
const showNotKittingOnly = ref(false);

/**
 * 加载表格数据
 */
function handleTableQuery(_params: any) {
  return new Promise((resolve) => {
    // TODO: 调用实际接口
    // const params = {
    //   page,
    //   pageSize,
    //   showNotKittingOnly: showNotKittingOnly.value,
    // };
    // return materialDetailApi.getMaterialDetail(params)
    //   .then(({ total, list }) => {
    //     resolve({ total, items: list });
    //   });

    // 模拟数据
    setTimeout(() => {
      const mockData: any[] = [
        {
          productName: '电阻 10K',
          productNo: 'RES-10K-0603',
          demand: 1000,
          unoccupiedStock: 800,
          inTransit: 100,
          kittingWithoutTransit: $t('status.no'),
          kittingWithTransit: $t('status.yes'),
        },
        {
          productName: '电容 100nF',
          productNo: 'CAP-100NF-0805',
          demand: 500,
          unoccupiedStock: 300,
          inTransit: 50,
          kittingWithoutTransit: $t('status.no'),
          kittingWithTransit: $t('status.no'),
        },
        {
          productName: '电感 10uH',
          productNo: 'IND-10UH-0603',
          demand: 200,
          unoccupiedStock: 250,
          inTransit: 0,
          kittingWithoutTransit: $t('status.yes'),
          kittingWithTransit: $t('status.yes'),
        },
        {
          productName: '芯片 STM32F103',
          productNo: 'IC-STM32F103-LQFP48',
          demand: 50,
          unoccupiedStock: 30,
          inTransit: 20,
          kittingWithoutTransit: $t('status.no'),
          kittingWithTransit: $t('status.yes'),
        },
      ];

      // 如果只显示不齐套，进行过滤
      const filteredData = showNotKittingOnly.value
        ? mockData.filter((item) => item.kittingWithTransit === $t('status.no'))
        : mockData;

      resolve({
        total: filteredData.length,
        items: filteredData,
      });
    }, 300);
  });
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('basic.materialDetail.sequence'), type: 'seq', minWidth: 60 },
    {
      field: 'productName',
      title: $t('basic.materialDetail.productName'),
      minWidth: 150,
    },
    {
      field: 'productNo',
      title: $t('basic.materialDetail.productNo'),
      minWidth: 150,
    },
    {
      field: 'demand',
      title: $t('basic.materialDetail.demand'),
      minWidth: 100,
    },
    {
      field: 'unoccupiedStock',
      title: $t('basic.materialDetail.unoccupiedStock'),
      minWidth: 120,
    },
    {
      field: 'inTransit',
      title: $t('basic.materialDetail.inTransit'),
      minWidth: 100,
    },
    {
      field: 'kittingWithoutTransit',
      title: $t('basic.materialDetail.kittingWithoutTransit'),
      minWidth: 140,
    },
    {
      field: 'kittingWithTransit',
      title: $t('basic.materialDetail.kittingWithTransit'),
      minWidth: 140,
    },
  ],
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

/**
 * 只显示不齐套复选框变化
 */
function handleCheckboxChange() {
  gridApi.reload();
}

defineExpose({
  reload: () => gridApi.reload(),
});
</script>

<template>
  <Card :title="$t('basic.materialDetail.title')">
    <template #extra>
      <Checkbox
        v-model:checked="showNotKittingOnly"
        @change="handleCheckboxChange"
      >
        {{ $t('basic.materialDetail.showNotKittingOnly') }}
      </Checkbox>
    </template>
    <Grid />
  </Card>
</template>

<style scoped></style>
