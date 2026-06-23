<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryProductionDaily } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'worksheetCode', title: $t('productionDaily.worksheetCode'), minWidth: 200 },
    { field: 'batchCode', title: $t('productionDaily.batchCode'), minWidth: 200 },
    { field: 'productCode', title: $t('productionDaily.productCode'), minWidth: 150 },
    { field: 'productName', title: $t('productionDaily.productName'), minWidth: 150 },
    { field: 'workstationCode', title: $t('productionDaily.workstationCode'), minWidth: 150 },
    { field: 'workstationName', title: $t('productionDaily.workstationName'), minWidth: 150 },
    { field: 'processCode', title: $t('productionDaily.processCode'), minWidth: 150 },
    { field: 'processName', title: $t('productionDaily.processName'), minWidth: 150 },
    {
      field: 'materialType',
      slots: { default: 'materialType' },
      title: $t('productionDaily.materialType'),
      minWidth: 150,
    },
    { field: 'cxEquipCode', title: $t('productionDaily.cxEquipCode'), minWidth: 150 },
    { field: 'personTime', title: $t('productionDaily.personTime'), minWidth: 150 },
    { field: 'equipTime', title: $t('productionDaily.equipTime'), minWidth: 150 },
    { field: 'worksheetPlanNumber', title: $t('productionDaily.worksheetPlanNumber'), minWidth: 150 },
    { field: 'inreportNumber', title: $t('productionDaily.inreportNumber'), minWidth: 150 },
    { field: 'outreportNumber', title: $t('productionDaily.outreportNumber'), minWidth: 150 },
    { field: 'unqualityNnumber', title: $t('productionDaily.unqualityNnumber'), minWidth: 150 },
    { field: 'inwarehouseNumber', title: $t('productionDaily.inwarehouseNumber'), minWidth: 150 },
    { field: 'materialUseNumber', title: $t('productionDaily.materialUseNumber'), minWidth: 150 },
    { field: 'weight', title: $t('productionDaily.weight'), minWidth: 150 },
    { field: 'jlqEnergyValue', title: $t('productionDaily.jlqEnergyValue'), minWidth: 150 },
    { field: 'denergyValue', title: $t('productionDaily.denergyValue'), minWidth: 150 },
    { field: 'trqEnergyValue', title: $t('productionDaily.trqEnergyValue'), minWidth: 150 },
    { field: 'smjEnergyValue', title: $t('productionDaily.smjEnergyValue'), minWidth: 150 },
    { field: 'jlqErrorValue', title: $t('productionDaily.jlqErrorValue'), minWidth: 150 },
    { field: 'derrorValue', title: $t('productionDaily.derrorValue'), minWidth: 150 },
    { field: 'trqErrorValue', title: $t('productionDaily.trqErrorValue'), minWidth: 150 },
    { field: 'smjErrorValue', title: $t('productionDaily.smjErrorValue'), minWidth: 150 },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
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
  toolbarConfig: {
    custom: true,
    // import: true,
    // export: true,
    refresh: true,
    zoom: true,
  },
};

const gridEvents: VxeGridListeners<any> = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 获取物料类型的中文描述
 * @param state 物料类型编码编码
 */
function getMaterialTypeText(state: number) {
  switch (state) {
    case 1: {
      return $t('productionDaily.rawMaterial');
    }
    case 2: {
      return $t('productionDaily.brickBlank');
    }
    default: {
      return $t('productionDaily.undefinedType');
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  //  工序编号
  processCode: '',
  // 工作站编号
  workstationCode: '',
  // 工作站名称
  workstationName: '',
  // 工单号
  worksheetCode: '',
  // 产品料号
  productCode: '',
  // 产品名称
  productName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    queryProductionDaily({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>
        <!-- 工序编号 -->
        <FormItem
          :label="$t('productionDaily.processCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.processCode" />
        </FormItem>

        <!-- 工作站编号 -->
        <FormItem
          :label="$t('productionDaily.workstationCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationCode" />
        </FormItem>
        <!-- 工作站编号 -->
        <FormItem
          :label="$t('productionDaily.workstationName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationName" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 产品料号 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('productionDaily.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="() => gridApi.reload()"
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 表格主体 -->
    <Card>
      <Grid>
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
