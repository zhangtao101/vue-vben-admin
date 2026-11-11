<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMesInputQuantityList, getWeekWorkSheets } from '#/api';
import { $t } from '#/locales';

/** 指示日期默认值：当前日期（yyyy-MM-dd） */
const DEFAULT_PLAN_DATE = () => dayjs().format('YYYY-MM-DD');

// ========== 查询参数（上方查询区域，作用于中间工单表格） ==========
const queryParams = ref<any>({
  lineName: '',
  // 工序默认混合水
  processType: 1,
  planDateStart: DEFAULT_PLAN_DATE(),
  productCode: '',
});

// ========== 下拉选项 ==========
/** 工序：1 混合水，2 混合mix，6 无重力搅拌 */
const processTypeOptions = [
  { label: $t('lotWorkOrderMesInputQuantity.processTypeMixedWater'), value: 1 },
  { label: $t('lotWorkOrderMesInputQuantity.processTypeMixedMix'), value: 2 },
  {
    label: $t('lotWorkOrderMesInputQuantity.processTypeGravityFree'),
    value: 6,
  },
];

// ========== 中间表格：工单列表（单选） ==========
const workSheetGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  radioConfig: { trigger: 'row', highlight: true },
  columns: [
    { type: 'radio', width: 50, title: '' },
    {
      title: $t('lotWorkOrderMesInputQuantity.workSheetCode'),
      field: 'workSheetCode',
      minWidth: 160,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.productName'),
      field: 'productName',
      minWidth: 160,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.productCode'),
      field: 'productCode',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.planDateStart'),
      field: 'planDateStart',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.lineName'),
      field: 'lineName',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.lineCode'),
      field: 'lineCode',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.indicateBatch'),
      field: 'indicateBatch',
      minWidth: 100,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.produceBatch'),
      field: 'produceBatch',
      minWidth: 100,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.remainBatch'),
      field: 'remainBatch',
      minWidth: 100,
    },
  ],
  height: 360,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryWorkSheets({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
  stripe: true,
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const workSheetGridEvents: VxeGridListeners<any> = {
  radioChange: ({ row }: any) => {
    // 单选工单后，按工单 id 重新查询下方物料投入明细
    selectedWorkSheetId.value = row?.id ?? undefined;
    detailGridApi?.reload();
  },
};

const [WorkSheetGrid, workSheetGridApi] = useVbenVxeGrid({
  gridEvents: workSheetGridEvents,
  gridOptions: workSheetGridOptions,
});

/**
 * 查询工单列表（按周查询，分页）。
 */
function queryWorkSheets({ pageNum, pageSize }: any) {
  return new Promise((resolve) => {
    const query = queryParams.value;
    const params: any = {
      lineName: query.lineName || undefined,
      processType: query.processType,
      planDateStart: query.planDateStart || undefined,
      productCode: query.productCode || undefined,
      pageNum,
      pageSize,
    };
    getWeekWorkSheets(params)
      .then(({ total, list }: any) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// ========== 最下方表格：物料投入明细（仅展示） ==========
/** 中间表格单选的工单 id，作为明细查询条件 */
const selectedWorkSheetId = ref<number | undefined>(undefined);

const detailGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: $t('lotWorkOrderMesInputQuantity.orddat'),
      field: 'orddat',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.wareky'),
      field: 'wareky',
      minWidth: 100,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.skukey'),
      field: 'skukey',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.qtyord'),
      field: 'qtyord',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.uomkey'),
      field: 'uomkey',
      minWidth: 80,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.swerks'),
      field: 'swerks',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.slgort'),
      field: 'slgort',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.gift'),
      field: 'gift',
      minWidth: 130,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.orderCs'),
      field: 'orderCs',
      minWidth: 110,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.trnuid'),
      field: 'trnuid',
      minWidth: 140,
    },
    {
      title: $t('lotWorkOrderMesInputQuantity.matnr'),
      field: 'matnr',
      minWidth: 130,
    },
  ],
  height: 300,
  pagerConfig: {
    enabled: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        return await queryDetails({
          pageNum: page.currentPage,
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

const [DetailGrid, detailGridApi] = useVbenVxeGrid({
  gridOptions: detailGridOptions,
});

/**
 * 查询当前选中工单的物料投入明细（分页），allocQty 不展示。
 */
function queryDetails({ pageNum, pageSize }: any) {
  if (selectedWorkSheetId.value == null) {
    return Promise.resolve({ items: [], total: 0 });
  }
  return new Promise((resolve) => {
    getMesInputQuantityList({
      workSheetId: selectedWorkSheetId.value,
      pageNum,
      pageSize,
    })
      .then(({ total, list }: any) => {
        resolve({
          total: total || 0,
          items: list || [],
        });
      })
      .catch(() => {
        resolve({ total: 0, items: [] });
      });
  });
}

// ========== 查询 / 重置 ==========
function handleSearch() {
  // 查询条件变化后清空选中工单，明细同步清空
  clearSelection();
  workSheetGridApi.reload();
}

function handleReset() {
  queryParams.value = {
    lineName: '',
    processType: 1,
    planDateStart: DEFAULT_PLAN_DATE(),
    productCode: '',
  };
  clearSelection();
  workSheetGridApi.reload();
}

/** 清空中间表格选中工单与下方明细 */
function clearSelection() {
  selectedWorkSheetId.value = undefined;
  workSheetGridApi.grid?.clearRadioRow();
  detailGridApi?.reload();
}
</script>

<template>
  <Page>
    <!-- 1. 查询区域（作用于中间工单表格） -->
    <Card class="!mb-4">
      <Form :model="queryParams" layout="inline">
        <FormItem
          :label="$t('lotWorkOrderMesInputQuantity.lineName')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.lineName"
            :placeholder="
              $t('lotWorkOrderMesInputQuantity.lineNamePlaceholder')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('lotWorkOrderMesInputQuantity.processType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.processType"
            :options="processTypeOptions"
            :placeholder="
              $t('lotWorkOrderMesInputQuantity.processTypePlaceholder')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('lotWorkOrderMesInputQuantity.planDateStart')"
          style="margin-bottom: 1em"
        >
          <DatePicker
            v-model:value="queryParams.planDateStart"
            :placeholder="
              $t('lotWorkOrderMesInputQuantity.planDateStartPlaceholder')
            "
            style="width: 150px"
            value-format="YYYY-MM-DD"
            allow-clear
          />
        </FormItem>
        <FormItem
          :label="$t('lotWorkOrderMesInputQuantity.productCode')"
          style="margin-bottom: 1em"
        >
          <Input
            v-model:value="queryParams.productCode"
            :placeholder="
              $t('lotWorkOrderMesInputQuantity.productCodePlaceholder')
            "
            style="width: 150px"
            allow-clear
          />
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button @click="handleReset">
            {{ $t('lotWorkOrderMesInputQuantity.reset') }}
          </Button>
        </FormItem>
        <FormItem style="margin-bottom: 1em">
          <Button type="primary" @click="handleSearch">
            {{ $t('lotWorkOrderMesInputQuantity.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>

    <!-- 2. 工单列表（单选，单选后联动下方明细） -->
    <Card :body-style="{ padding: '4px' }">
      <WorkSheetGrid>
        <template #toolbar-tools></template>
      </WorkSheetGrid>
    </Card>

    <!-- 3. 物料投入明细（仅展示，随上方单选联动） -->
    <Card class="mt-4!" :body-style="{ padding: '4px' }">
      <DetailGrid>
        <template #toolbar-tools></template>
      </DetailGrid>
    </Card>
  </Page>
</template>
