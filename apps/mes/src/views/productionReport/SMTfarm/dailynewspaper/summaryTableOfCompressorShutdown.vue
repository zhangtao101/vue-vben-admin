<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, RangePicker } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { excelPathYJStopHZStatistics, queryYJStopHZStatistics } from '#/api';
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
    // { field: 'month', title: $t('productionDaily.Date'), minWidth: 200 },
    { field: 'workstation', title: $t('productionDaily.workstation'), minWidth: 200 },
    { field: 'typeName', title: $t('productionDaily.Type'), minWidth: 200 },
    { field: 'stopTime', title: $t('productionDaily.StopTimeTotal_1'), minWidth: 200 },
    { field: 'stopValue', title: $t('productionDaily.TotalShutdownEnergy'), minWidth: 200 },
    {
      title: $t('productionDaily.customNewProduct'),
      children: [
        {
          field: 'KDPXPDY',
          title: $t('productionDaily.colorMatchingSample'),
          minWidth: 150,
        },
        {
          field: 'KDPXPDYNH',
          title: $t('productionDaily.Energy_2'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.preProductionSampleCheck'),
      children: [
        {
          field: 'CQDY',
          title: $t('productionDaily.preProductionSampleCheck'),
          minWidth: 150,
        },
        {
          field: 'CQDYNH',
          title: $t('productionDaily.Energy'),
          minWidth: 150,
        },
      ],
    },
    {
      title: $t('productionDaily.processAdjustment_1'),
      children: [
        { field: 'gytcdb', title: $t('productionDaily.Pkg'), minWidth: 150 },
        { field: 'gytcdbnh', title: $t('productionDaily.EnergyPkg'), minWidth: 150 },
        { field: 'gytcpg', title: $t('productionDaily.Polish'), minWidth: 150 },
        { field: 'gytcpgnh', title: $t('productionDaily.PolishEnergy'), minWidth: 150 },
        { field: 'gytcsc', title: $t('productionDaily.Kiln'), minWidth: 150 },
        { field: 'gytcscnh', title: $t('productionDaily.KilnEnergy'), minWidth: 150 },
        { field: 'sctcsy', title: $t('productionDaily.Glaze_1'), minWidth: 150 },
        { field: 'gytcsynh', title: $t('productionDaily.EnergyGlaze'), minWidth: 150 },
        { field: 'gytcwg', title: $t('productionDaily.horizontalDrying'), minWidth: 150 },
        { field: 'gytcwgnh', title: $t('productionDaily.Energy_5'), minWidth: 150 },
        { field: 'gytccx', title: $t('productionDaily.forming'), minWidth: 150 },
        { field: 'gytccxnh', title: $t('productionDaily.Energy_1'), minWidth: 150 },
        { field: 'gytcyl', title: $t('productionDaily.RawMaterial'), minWidth: 150 },
        { field: 'gytcylnh', title: $t('productionDaily.EnergyRawMaterial'), minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.productionBatchNo_1'),
      children: [
        { field: 'sctcdb', title: $t('productionDaily.Pkg'), minWidth: 150 },
        { field: 'sctcdbnh', title: $t('productionDaily.EnergyPkg'), minWidth: 150 },
        { field: 'sctcpg', title: $t('productionDaily.Polish'), minWidth: 150 },
        { field: 'sctcpgnh', title: $t('productionDaily.PolishEnergy'), minWidth: 150 },
        { field: 'sctcsc', title: $t('productionDaily.Kiln'), minWidth: 150 },
        { field: 'sctcscnh', title: $t('productionDaily.KilnEnergy'), minWidth: 150 },
        { field: 'sctcsy', title: $t('productionDaily.Glaze_1'), minWidth: 150 },
        { field: 'sctcsynh', title: $t('productionDaily.EnergyGlaze'), minWidth: 150 },
        { field: 'sctcwg', title: $t('productionDaily.horizontalDrying'), minWidth: 150 },
        { field: 'sctcwgnh', title: $t('productionDaily.Energy_5'), minWidth: 150 },
        { field: 'sctccx', title: $t('productionDaily.forming'), minWidth: 150 },
        { field: 'sctccxnh', title: $t('productionDaily.Energy_1'), minWidth: 150 },
        { field: 'sctcyl', title: $t('productionDaily.RawMaterial'), minWidth: 150 },
        { field: 'sctcylnh', title: $t('productionDaily.EnergyRawMaterial'), minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.Equipment'),
      children: [
        { field: 'sbgzdb', title: $t('productionDaily.Pkg'), minWidth: 150 },
        { field: 'sbgzdbn', title: $t('productionDaily.EnergyPkg'), minWidth: 150 },
        { field: 'sbgzpg', title: $t('productionDaily.Polish'), minWidth: 150 },
        { field: 'sbgzpgnh', title: $t('productionDaily.PolishEnergy'), minWidth: 150 },
        { field: 'sbgzyl', title: $t('productionDaily.Kiln'), minWidth: 150 },
        { field: 'sbgzylnh', title: $t('productionDaily.KilnEnergy'), minWidth: 150 },
        { field: 'sbgzyx', title: $t('productionDaily.Glaze_1'), minWidth: 150 },
        { field: 'sbgzyxnh', title: $t('productionDaily.EnergyGlaze'), minWidth: 150 },
        { field: 'sbgzsg', title: $t('productionDaily.horizontalDrying'), minWidth: 150 },
        { field: 'sbgzsgnh', title: $t('productionDaily.Energy_5'), minWidth: 150 },
        { field: 'sbgzcx', title: $t('productionDaily.forming'), minWidth: 150 },
        { field: 'sbgzcxnh', title: $t('productionDaily.Energy_1'), minWidth: 150 },
        { field: 'sbgzfz', title: $t('productionDaily.RawMaterial'), minWidth: 150 },
        { field: 'sbgzfznh', title: $t('productionDaily.EnergyRawMaterial'), minWidth: 150 },
      ],
    },
    { field: 'sczc', title: $t('productionDaily.Changeover'), minWidth: 150 },
    { field: 'sczcn', title: $t('productionDaily.Capacity_1'), minWidth: 150 },
    { field: 'cnxz', title: $t('productionDaily.CapacityLimit'), minWidth: 150 },
    { field: 'cnxznh', title: $t('productionDaily.CapacityEnergyLimit'), minWidth: 150 },
    { field: 'zrzh', title: $t('productionDaily.NaturalDisaster'), minWidth: 150 },
    { field: 'zrzhnh', title: $t('productionDaily.EnergyNaturalDisaster'), minWidth: 150 },
    { field: 'sbqx', title: $t('productionDaily.Equipment_1'), minWidth: 150 },
    { field: 'sbqxnh', title: $t('productionDaily.EnergyEquipment'), minWidth: 150 },
    { field: 'sczz', title: $t('productionDaily.Exception'), minWidth: 200 },
    { field: 'sczznh', title: $t('productionDaily.EnergyException'), minWidth: 200 },
  ],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 8 }],
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

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
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
    queryYJStopHZStatistics({
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

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathYJStopHZStatistics(params).then((data) => {
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
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
