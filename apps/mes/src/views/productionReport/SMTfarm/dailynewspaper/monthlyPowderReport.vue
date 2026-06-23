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
import { excelPathYLReportMonth, queryYLReportMonthStatistics } from '#/api';
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
    { field: 'month', title: $t('productionDaily.Date'), minWidth: 200 },
    { field: 'startDay', title: $t('productionDaily.TimeStart'), minWidth: 200 },
    { field: 'endDay', title: $t('productionDaily.TimeEnd'), minWidth: 200 },
    { field: 'worksheetCode', title: $t('productionDaily.WorkOrder_1'), minWidth: 200 },
    { field: 'productCode', title: $t('productionDaily.CodeProduct'), minWidth: 200 },
    { field: 'productName', title: $t('productionDaily.NameProductFormula'), minWidth: 200 },
    {
      field: 'planNumber',
      title: $t('productionDaily.Plan_1'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'reportNumber',
      title: $t('productionDaily.QtyReportT'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'equipCode',
      title: $t('productionDaily.CodeEquipment'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'equipName',
      title: $t('productionDaily.NameEquipment'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: $t('productionDaily.ballMill'),
      children: [
        {
          field: 'feedNumber',
          title: $t('productionDaily.T_7'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'unFeedNumber',
          title: $t('productionDaily.T_6'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'dayInNumber',
          title: $t('productionDaily.InboundT_1'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.sprayDryingQty_1'),
      children: [
        {
          field: 'pfCurrentTime',
          title: $t('productionDaily.Time_4'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zfOutNumber',
          title: $t('productionDaily.T_4'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zffeedNumber',
          title: $t('productionDaily.InputT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zfReportNumber',
          title: $t('productionDaily.ReportT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zfDayInNumber',
          title: $t('productionDaily.InboundT'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: 'dlstartEnergyNumber',
      title: $t('productionDaily.StartElectric'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlendEnergyNumber',
      title: $t('productionDaily.EndElectric'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dluseEnergyNumber',
      title: $t('productionDaily.Energy_4'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlperUseNumber',
      title: $t('productionDaily.EnergyElectric'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trqstartEnergyNumber',
      title: $t('productionDaily.NaturalGasStart'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trqendEnergyNumber',
      title: $t('productionDaily.NaturalGasEnd'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trquseEnergyNumber',
      title: $t('productionDaily.NaturalGasM3Usage_1'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'smjstartEnergyNumber',
      title: $t('productionDaily.CWSStart'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'smjendEnergyNumber',
      title: $t('productionDaily.CWSEnd'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'smjuseEnergyNumber',
      title: $t('productionDaily.CWSKGUsage_1'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'jlqstartEnergyNumber',
      title: $t('productionDaily.COGStart'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'jlqendEnergyNumber',
      title: $t('productionDaily.COGEnd'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'jlquseEnergyNumber',
      title: $t('productionDaily.COG'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'currentTime',
      title: $t('productionDaily.WorkOrder_3'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'perOutput',
      title: $t('productionDaily.Capacity'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlperUseNumber',
      title: $t('productionDaily.EnergyElectric'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'jlqperUseNumber',
      title: $t('productionDaily.COGEnergy'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trqperUseNumber',
      title: $t('productionDaily.NaturalGasEnergy'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'smjperUseNumber',
      title: $t('productionDaily.CWSEnergyKG'),
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
  ],
  footerData: [{ seq: $t('productionDaily.total') }],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 7 }],
  height: 500,
  stripe: true,
  showFooter: true,
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
  // 工单号
  worksheetCode: '',
  // 工序编号
  processCode: '',
  // 工作站编号
  workstationCode: '',
  // 工作站名称
  workstationName: '',
  // 产品料号
  productCode: '',
  // 产品名称
  productName: '',
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
    queryYLReportMonthStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ monthStatisticsDtos: { total, list }, ...p }) => {
        collect.value = p;
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
  excelPathYLReportMonth(params).then((data) => {
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

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
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

        <!-- 工作站名称 -->
        <FormItem
          :label="$t('productionDaily.workstationName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workstationName" />
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
        <template #toolbar-tools>
          <!-- 导出按钮 -->
          <Button type="primary" @click="downloadTemplate()">
            {{ $t('common.export') }}
          </Button>
        </template>
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
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
