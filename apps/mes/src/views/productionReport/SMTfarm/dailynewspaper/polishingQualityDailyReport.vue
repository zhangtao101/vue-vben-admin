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
import {
  excelPathPolishingZLDayStatistics,
  queryPolishingZLDayStatistics,
} from '#/api';
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
    { field: 'scline', title: $t('productionDaily.Line'), minWidth: 200 },
    { field: 'class', title: $t('productionDaily.Shift'), minWidth: 200 },
    { field: 'productName', title: $t('productionDaily.NameProduct'), minWidth: 200 },
    { field: 'productCode', title: $t('productionDaily.CodeProduct_1'), minWidth: 200 },
    { field: 'lineName', title: $t('productionDaily.Product'), minWidth: 200 },
    { field: 'size', title: $t('productionDaily.Area'), minWidth: 200 },
    {
      field: 'inReportNumber',
      title: $t('productionDaily.InputPiece'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'inReportNumberM2',
      title: $t('productionDaily.InputM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'outReportNumber',
      title: $t('productionDaily.OutputPiece'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'outReportNumberM2',
      title: $t('productionDaily.OutputM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'qpssum',
      title: $t('productionDaily.PreBrokenTotalPiece'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'qpssumM2',
      title: $t('productionDaily.PreBrokenTotalM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'hpssum',
      title: $t('productionDaily.PostBrokenTotalPiece'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'hpssumM2',
      title: $t('productionDaily.PostBrokenTotalM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pssum',
      title: $t('productionDaily.TotalBrokenPiece'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pssumM2',
      title: $t('productionDaily.TotalBrokenM2'),
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: $t('productionDaily.InboundRate'),
      children: [
        {
          field: 'inMBPA',
          title: $t('productionDaily.target'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'inSJPA',
          title: $t('productionDaily.Actual'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.Rate'),
      children: [
        {
          field: 'ylqpsl',
          title: $t('productionDaily.PreBroken'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'hqpsl',
          title: $t('productionDaily.PostBroken'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.InboundDefectRate'),
      children: [
        {
          field: 'qxwl',
          title: $t('productionDaily.ColorDiffPitGlaze'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxel',
          title: $t('productionDaily.flatnessExceeded'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtl',
          title: $t('productionDaily.colorSpotImpurityMixed'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfl',
          title: $t('productionDaily.secondGradeDefects'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyl',
          title: $t('productionDaily.BurrDelamSurfaceSide'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxll',
          title: $t('productionDaily.ColorDiff'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxol',
          title: $t('productionDaily.PitGlaze'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpl',
          title: $t('productionDaily.chippedCornerDiagonal'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.Inbound_2'),
      children: [
        {
          field: 'qxwin',
          title:
            '洞孔，釉粒，破釉，凹坑，不料不均，混料，色差，阴阳面，线条(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxwinM2',
          title:
            '洞孔，釉粒，破釉，凹坑，不料不均，混料，色差，阴阳面，线条(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxein',
          title: $t('productionDaily.Piece_6'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxeinM2',
          title: $t('productionDaily.M2_11'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtin',
          title: $t('productionDaily.Piece_10'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtinM2',
          title: $t('productionDaily.M2_19'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfin',
          title: $t('productionDaily.Piece_2'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfinM2',
          title: $t('productionDaily.M2_6'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyin',
          title: $t('productionDaily.BurrDelamSurfaceSidePiece'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyinM2',
          title: $t('productionDaily.M2BurrDelamSurfaceSide'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlin',
          title: $t('productionDaily.ColorDiffPiece'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlinM2',
          title: $t('productionDaily.ColorDiffM2'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxoin',
          title: $t('productionDaily.PitGlazePiece'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxoinM2',
          title: $t('productionDaily.M2PitGlaze'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpin',
          title: $t('productionDaily.Piece_7'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpinM2',
          title: $t('productionDaily.M2_14'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: $t('productionDaily.Grade2SpecScrap'),
      children: [
        {
          field: 'qxwfw',
          title: $t('productionDaily.ColorDiffPitGlaze'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxefw',
          title: $t('productionDaily.flatnessExceeded'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtfw',
          title: $t('productionDaily.colorSpotImpurityMixed'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxffw',
          title: $t('productionDaily.secondGradeDefects'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyfw',
          title: $t('productionDaily.BurrDelamSurfaceSide'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlfw',
          title: $t('productionDaily.ColorDiff'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxofw',
          title: $t('productionDaily.PitGlaze'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpfw',
          title: $t('productionDaily.chippedCornerDiagonal'),
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
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
  // 生产线
  sCline: '',
  // 产品批号
  lineName: '',
  // 产品编码
  productCode: '',
  // 产品名称
  materialName: '',
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
    queryPolishingZLDayStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ statisticsDtos: { total, list }, ...p }) => {
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

// region 文件下载

function downloadTemplate() {
  const params: any = { ...queryParams.value };
  if (params.searchTime && params.searchTime.length === 2) {
    params.startTime = params.searchTime[0].format('YYYY-MM-DD');
    params.endTime = params.searchTime[1].format('YYYY-MM-DD');
    params.searchTime = undefined;
  }
  excelPathPolishingZLDayStatistics(params).then((data) => {
    window.open(data);
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

        <!-- 生产线 -->
        <FormItem
          :label="$t('productionDaily.productionLine')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.sCline" />
        </FormItem>

        <!-- 产品批号 -->
        <FormItem
          :label="$t('productionDaily.productLotNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
        </FormItem>

        <!-- 产品编号 -->
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
          <Input v-model:value="queryParams.materialName" />
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
