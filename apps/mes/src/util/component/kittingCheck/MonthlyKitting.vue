<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const formData = ref({
  month: undefined as string | undefined,
  productCode: '',
  productName: '',
});

const columns: any[] = [
  { field: 'month', title: $t('basic.monthlyKitting.month'), minWidth: 100 },
  {
    field: 'productCode',
    title: $t('basic.monthlyKitting.productCode'),
    minWidth: 120,
  },
  {
    field: 'productName',
    title: $t('basic.monthlyKitting.productName'),
    minWidth: 180,
  },
  {
    field: 'totalQty',
    title: $t('basic.monthlyKitting.totalQty'),
    minWidth: 100,
  },
  {
    field: 'kittingQty',
    title: $t('basic.monthlyKitting.kittingQty'),
    minWidth: 100,
  },
  {
    field: 'kittingRate',
    title: $t('basic.monthlyKitting.kittingRate'),
    minWidth: 100,
  },
  {
    field: 'orderCount',
    title: $t('basic.monthlyKitting.orderCount'),
    minWidth: 100,
  },
  { field: 'status', title: $t('basic.monthlyKitting.status'), minWidth: 100 },
];

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns,
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 20,
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
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

/**
 * 表格查询
 */
function handleTableQuery(_params: any) {
  return new Promise((resolve) => {
    // const params: any = {
    //   page,
    //   pageSize,
    //   ...formData.value,
    // };

    // TODO: 调用实际接口
    // return kittingCheckApi.getMonthlyKitting(params)
    //   .then(({ total, list }) => {
    //     resolve({ total, items: list });
    //   });

    // 模拟数据
    setTimeout(() => {
      resolve({
        total: 3,
        items: [
          {
            kittingQty: 500,
            kittingRate: 95,
            month: '2026-03',
            orderCount: 5,
            productCode: 'P001',
            productName: 'SMT主板A',
            status: $t('basic.monthlyKitting.kitting'),
            totalQty: 500,
          },
          {
            kittingQty: 450,
            kittingRate: 90,
            month: '2026-03',
            orderCount: 4,
            productCode: 'P002',
            productName: 'SMT主板B',
            status: $t('basic.monthlyKitting.notKitting'),
            totalQty: 500,
          },
          {
            kittingQty: 600,
            kittingRate: 100,
            month: '2026-03',
            orderCount: 6,
            productCode: 'P003',
            productName: 'SMT主板C',
            status: $t('basic.monthlyKitting.kitting'),
            totalQty: 600,
          },
        ],
      });
    }, 300);
  });
}

/**
 * 查询
 */
function handleSearch() {
  gridApi.reload();
}

/**
 * 导出
 */
function handleExport() {
  console.log('导出月齐套数据');
}
</script>

<template>
  <div>
    <Card class="!mb-4">
      <Form layout="inline">
        <FormItem :label="$t('basic.monthlyKitting.month')">
          <DatePicker.MonthPicker
            v-model:value="formData.month"
            :placeholder="$t('basic.monthlyKitting.pleaseSelectMonth')"
          />
        </FormItem>
        <FormItem :label="$t('basic.monthlyKitting.productCode')">
          <Input
            v-model:value="formData.productCode"
            :placeholder="$t('basic.monthlyKitting.pleaseInputProductCode')"
          />
        </FormItem>
        <FormItem :label="$t('basic.monthlyKitting.productName')">
          <Input
            v-model:value="formData.productName"
            :placeholder="$t('basic.monthlyKitting.pleaseInputProductName')"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="handleSearch">
              {{ $t('basic.monthlyKitting.query') }}
            </Button>
            <Button @click="handleExport">
              {{ $t('basic.monthlyKitting.export') }}
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <Grid />
    </Card>
  </div>
</template>

<style scoped></style>
