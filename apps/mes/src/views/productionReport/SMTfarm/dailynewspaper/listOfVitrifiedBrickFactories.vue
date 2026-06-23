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
import { excelPathgetBHZMXStatistics, queryBHZMXStatistics } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: $t('page.common.serialNumber'),
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    { field: 'day', title: $t('productionDaily.Date'), minWidth: 200 },
    { field: 'worksheetCode', title: $t('productionDaily.WorkOrder_1'), minWidth: 200 },
    { field: 'lineName', title: $t('productionDaily.productionBatchNo'), minWidth: 200 },
    { field: 'productCode', title: $t('productionDaily.CodeProduct_1'), minWidth: 200 },
    {
      field: 'flMaterialNumber',
      title: $t('productionDaily.PowderUsageT'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pressQuantity',
      title: $t('productionDaily.M2_21'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pressTon',
      title: $t('productionDaily.WeightT'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'inYLQuantity',
      title: $t('productionDaily.M2_8'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'inStorageQuantity',
      title: $t('productionDaily.InboundM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'bf',
      title: $t('productionDaily.Scrap'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'cxTime',
      title: $t('productionDaily.Time'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgTrq',
      title: $t('productionDaily.GasM3_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlValue',
      title: $t('productionDaily.Electric'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'injp',
      title: $t('productionDaily.pendingPolishInputJP'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'qps',
      title: $t('productionDaily.PreBroken_2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'actualTon',
      title: $t('productionDaily.Actual_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgName',
      title: $t('productionDaily.Name_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wf',
      title: $t('productionDaily.wastePowder'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgsmj',
      title: $t('productionDaily.horizontalDrying_2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'ylsmj',
      title: $t('productionDaily.Kiln_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'stopTime',
      title: $t('productionDaily.StopTime'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: $t('productionDaily.processAdjustment_1'),
      children: [
        {
          field: 'gytcdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcsc',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsy',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcwg',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytccx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcyl',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.productionBatchNo_1'),
      children: [
        {
          field: 'sctcdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsc',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsy',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcwg',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctccx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcyl',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.Equipment'),
      children: [
        {
          field: 'sbgzdb',
          title: $t('productionDaily.Pkg'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzpg',
          title: $t('productionDaily.Polish'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzyl',
          title: $t('productionDaily.Kiln'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzyx',
          title: $t('productionDaily.Glaze_1'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzsg',
          title: $t('productionDaily.horizontalDrying'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzcx',
          title: $t('productionDaily.forming'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzfz',
          title: $t('productionDaily.RawMaterial'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: 'sczc',
      title: $t('productionDaily.Changeover'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'cnxz',
      title: $t('productionDaily.CapacityLimit'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'zrzh',
      title: $t('productionDaily.NaturalDisaster'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sbqx',
      title: $t('productionDaily.Equipment_1'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sczz',
      title: $t('productionDaily.Exception'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'kdpxpdy',
      title: $t('productionDaily.customNewProduct_1'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'cqdy',
      title: $t('productionDaily.preProductionSampleCheck'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
  ],
  footerData: [{ seq: $t('productionDaily.total') }],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 6 }],
  height: 500,
  stripe: true,
  showFooter: false,
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

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编码
  productCode: '',
  // 产品批号
  lineName: '',
});

// 汇总数据
const collect = ref<any>({});
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
    queryBHZMXStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // { statisticsDtos: { total, list }, ...p }
        // collect.value = p;
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

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathgetBHZMXStatistics(params).then((data) => {
    window.open(data);
  });
}

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
        <!-- 产品编码 -->
        <FormItem
          :label="$t('productionDaily.productCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>
        <!-- 批次号 -->
        <FormItem
          :label="$t('productionDaily.batchNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
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
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" @click="downloadTemplate()">
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #footerData="{ column }">
          <span> {{ collect[column.field] }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
