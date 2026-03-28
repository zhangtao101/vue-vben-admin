<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Select,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { fetchMaterialAllotList, fetchWarehouseMaterialList } from '#/api';
import { queryAuth } from '#/util';

const route = useRoute();
const author = ref<string[]>([]);
const permissions = computed(() => ({
  print: author.value.includes('打印'),
}));

const queryParams = ref<Record<string, any>>({
  formCode: '',
  materialCode: '',
  materialName: '',
  outWarehouseCode: undefined as string | undefined,
  enterWarehouseCode: undefined as string | undefined,
  operateDateStart: '',
  operateDateEnd: '',
});

const dateRange = ref<any>(null);
const warehouseOptions = ref<{ label: string; value: string }[]>([]);

function formatCheckResult(val: null | number | undefined) {
  if (val === 1) return $t('storeManagement.inspectionSlip.qualified');
  if (val === 2) return $t('storeManagement.inspectionSlip.unqualified');
  if (val === 3) return $t('storeManagement.inspectionSlip.concessionAccept');
  if (val === 4) return $t('storeManagement.inspectionSlip.emergencyRelease');
  return '';
}

function formatDateOnly(val: null | string | undefined) {
  if (!val) return '';
  return val.length >= 10 ? val.slice(0, 10) : val;
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'transferFormCode',
      title: $t('storeManagement.materialAllot.transferFormCode'),
      minWidth: 150,
    },
    {
      field: 'itemOrder',
      title: $t('storeManagement.materialAllot.itemOrder'),
      width: 80,
    },
    {
      field: 'operateDate',
      title: $t('storeManagement.materialAllot.allotDate'),
      minWidth: 110,
      slots: { default: 'allotDate' },
    },
    {
      field: 'materialCode',
      title: $t('storeManagement.labelPrint.materialCode'),
      minWidth: 100,
    },
    {
      field: 'materialName',
      title: $t('storeManagement.labelPrint.materialName'),
      minWidth: 200,
    },
    {
      field: 'unit',
      title: $t('storeManagement.labelPrint.unit'),
      width: 80,
    },
    {
      field: 'checkResult',
      title: $t('storeManagement.materialAllot.checkResult'),
      minWidth: 100,
      slots: { default: 'checkResult' },
    },
    {
      field: 'number',
      title: $t('storeManagement.materialAllot.transferQty'),
      minWidth: 100,
    },
    {
      field: 'oldLabelCode',
      title: $t('storeManagement.materialAllot.oldLabelCode'),
      minWidth: 160,
    },
    {
      field: 'labelCode',
      title: $t('storeManagement.materialAllot.labelCodeAfterOut'),
      minWidth: 160,
    },
    {
      field: 'outLogicalWarehouseName',
      title: $t('storeManagement.materialAllot.outLogicalWarehouseName'),
      minWidth: 160,
    },
    {
      field: 'enterLogicalWarehouseName',
      title: $t('storeManagement.materialAllot.enterLogicalWarehouseName'),
      minWidth: 160,
    },
    {
      field: 'outWarehouseName',
      title: $t('storeManagement.materialAllot.outWarehouse'),
      minWidth: 120,
    },
    {
      field: 'outWareAreaName',
      title: $t('storeManagement.materialAllot.outWareAreaName'),
      minWidth: 120,
    },
    {
      field: 'outWareLocationName',
      title: $t('storeManagement.materialAllot.outWareLocationName'),
      minWidth: 120,
    },
    {
      field: 'enterWarehouseName',
      title: $t('storeManagement.materialAllot.enterWarehouse'),
      minWidth: 120,
    },
    {
      field: 'enterWareAreaName',
      title: $t('storeManagement.materialAllot.enterWareAreaName'),
      minWidth: 120,
    },
    {
      field: 'enterWareLocationName',
      title: $t('storeManagement.materialAllot.enterWareLocationName'),
      minWidth: 120,
    },
    {
      field: 'manufacturerName',
      title: $t('storeManagement.labelPrint.manufacturerName'),
      minWidth: 120,
    },
    {
      field: 'validDate',
      title: $t('storeManagement.labelPrint.validDate'),
      minWidth: 100,
    },
    {
      field: 'batchCode',
      title: $t('storeManagement.labelPrint.batchCode'),
      minWidth: 120,
    },
    {
      field: 'produceDate',
      title: $t('storeManagement.labelPrint.produceDate'),
      minWidth: 100,
    },
    {
      field: 'contractCode',
      title: $t('storeManagement.labelPrint.contractCode'),
      minWidth: 100,
    },
    {
      field: 'operatorName',
      title: $t('storeManagement.materialAllot.operatorName'),
      minWidth: 100,
    },
    {
      field: 'operateDateFull',
      title: $t('storeManagement.materialAllot.operateTime'),
      minWidth: 160,
      slots: { default: 'operateTime' },
    },
  ],
  height: 500,
  pagerConfig: {
    enabled: true,
    pageSize: 50,
    pageSizes: [10, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await queryData({
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

/** Vben 封装的 VxeGrid（vxe-table） */
const [VxeGrid, gridApi] = useVbenVxeGrid({ gridOptions });

function queryData({ page, pageSize }: { page: number; pageSize: number }) {
  return new Promise<{ items: any[]; total: number }>((resolve, reject) => {
    const params = {
      ...queryParams.value,
      pageNum: page,
      pageSize,
    };
    fetchMaterialAllotList(params)
      .then((data: any) => {
        const results = data?.results ?? [];
        const total = data?.total ?? 0;
        const items = results.map((row: any) => ({
          ...row,
          operateDateFull: row.operateDate,
        }));
        resolve({ items, total });
      })
      .catch(reject);
  });
}

function handleDateChange(_: any, dateStrings: [string, string]) {
  if (dateStrings?.[0] && dateStrings?.[1]) {
    queryParams.value.operateDateStart = dateStrings[0];
    queryParams.value.operateDateEnd = dateStrings[1];
  } else {
    queryParams.value.operateDateStart = '';
    queryParams.value.operateDateEnd = '';
  }
}

function handleQuery() {
  gridApi.reload();
}

function loadWarehouses() {
  fetchWarehouseMaterialList()
    .then((data: any) => {
      const list = Array.isArray(data) ? data : [];
      warehouseOptions.value = list.map((w: any) => ({
        label: w.warehouseName,
        value: w.warehouseCode,
      }));
    })
    .catch(() => {
      warehouseOptions.value = [];
    });
}

function handleOpenPrint() {
  message.warning('打印功能未完成');
}

onMounted(() => {
  loadWarehouses();
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.materialAllot.transferFormCode')"
        >
          <Input
            v-model:value="queryParams.formCode"
            class="!w-[150px]"
            :placeholder="$t('common.pleaseEnter')"
            allow-clear
          />
        </FormItem>
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.labelPrint.materialCode')"
        >
          <Input
            v-model:value="queryParams.materialCode"
            class="!w-[150px]"
            :placeholder="$t('common.pleaseEnter')"
            allow-clear
          />
        </FormItem>
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.labelPrint.materialName')"
        >
          <Input
            v-model:value="queryParams.materialName"
            class="!w-[150px]"
            :placeholder="$t('common.pleaseEnter')"
            allow-clear
          />
        </FormItem>
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.materialAllot.outWarehouseCode')"
        >
          <Select
            v-model:value="queryParams.outWarehouseCode"
            class="!w-40"
            :placeholder="$t('common.pleaseSelect')"
            :options="warehouseOptions"
            allow-clear
          />
        </FormItem>
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.materialAllot.enterWarehouseCode')"
        >
          <Select
            v-model:value="queryParams.enterWarehouseCode"
            class="!w-40"
            :placeholder="$t('common.pleaseSelect')"
            :options="warehouseOptions"
            allow-clear
          />
        </FormItem>
        <FormItem
          class="!mb-4"
          :label="$t('storeManagement.materialAllot.allotDate')"
        >
          <DatePicker.RangePicker
            v-model:value="dateRange"
            class="!w-60"
            @change="handleDateChange"
          />
        </FormItem>
        <FormItem class="!mb-4">
          <Button type="primary" @click="handleQuery">
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <Card>
      <VxeGrid>
        <template #toolbar-tools>
          <Space>
            <Button
              v-if="permissions.print"
              type="primary"
              @click="handleOpenPrint"
            >
              {{ $t('common.print') }}
            </Button>
          </Space>
        </template>
        <template #allotDate="{ row }">
          {{ formatDateOnly(row.operateDate) }}
        </template>
        <template #checkResult="{ row }">
          {{ formatCheckResult(row.checkResult) }}
        </template>
        <template #operateTime="{ row }">
          {{ row.operateDateFull ?? row.operateDate ?? '' }}
        </template>
      </VxeGrid>
    </Card>
  </Page>
</template>
