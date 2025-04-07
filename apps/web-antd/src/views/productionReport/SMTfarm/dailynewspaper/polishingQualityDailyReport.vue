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
import { excelPathYLDay, queryPolishingZLDayStatistics } from '#/api';
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
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    { field: 'day', title: '日期', minWidth: 200 },
    { field: 'scline', title: '生产线', minWidth: 200 },
    { field: 'class', title: '班次', minWidth: 200 },
    { field: 'productCode', title: '产品名称', minWidth: 200 },
    { field: 'productName', title: '产品编码', minWidth: 200 },
    { field: 'lineName', title: '产品批号', minWidth: 200 },
    { field: 'size', title: '面积', minWidth: 200 },
    { field: 'inReportNumber', title: '投入量(片)', minWidth: 200 },
    { field: 'inReportNumberM2', title: '投入量(M2)', minWidth: 200 },
    { field: 'outReportNumber', title: '产出量(片)', minWidth: 200 },
    { field: 'outReportNumberM2', title: '产出量(M2)', minWidth: 200 },
    { field: 'qpssum', title: '前破碎合计(片)', minWidth: 200 },
    { field: 'qpssumM2', title: '前破碎合计(M2)', minWidth: 200 },
    {
      title: '入库PA率(PA量/入库量)',
      children: [
        {
          field: 'inMBPA',
          title: '目标',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'inSJPA',
          title: '实际',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '前破碎率（破碎合计/投入量）',
      children: [
        {
          field: 'mbqpsl',
          title: '目标',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'ylqpsl',
          title: '窑炉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '缺陷率（缺陷量/入库量）',
      children: [
        {
          field: 'qxwl',
          title: '洞孔，釉粒，破釉，凹坑，不料不均，混料，色差，阴阳面，线条',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxel',
          title: '平整度超标，凹超，凸超，翘角，塌角，玻浪型超标',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtl',
          title: '色点，杂质，混料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfl',
          title: '二等色点，杂质，混料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyl',
          title: '表面分层，开裂，侧面分层，毛口',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxll',
          title: '色差，阴阳面，平整度',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxol',
          title: '洞孔，釉粒，破釉，凹坑，喷釉不均，线条',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpl',
          title: '缺角，对角线',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '入库量分布',
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
          title: '平整度超标，凹超，凸超，翘角，塌角，玻浪型超标(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxeinM2',
          title: '平整度超标，凹超，凸超，翘角，塌角，玻浪型超标(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtin',
          title: '色点，杂质，混料(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtinM2',
          title: '色点，杂质，混料(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfin',
          title: '二等色点，杂质，混料(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxfinM2',
          title: '二等色点，杂质，混料(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyin',
          title: '表面分层，开裂，侧面分层，毛口(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyinM2',
          title: '表面分层，开裂，侧面分层，毛口(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlin',
          title: '色差，阴阳面，平整度(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlinM2',
          title: '色差，阴阳面，平整度(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxoin',
          title: '洞孔，釉粒，破釉，凹坑，喷釉不均，线条(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxoinM2',
          title: '洞孔，釉粒，破釉，凹坑，喷釉不均，线条(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpin',
          title: '缺角，对角线(片)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpinM2',
          title: '缺角，对角线(M2)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '报废（磨边砖800、600*1200规格无二等品，40砖无等级品）',
      children: [
        {
          field: 'qxwfw',
          title: '洞孔，釉粒，破釉，凹坑，不料不均，混料，色差，阴阳面，线条',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxefw',
          title: '平整度超标，凹超，凸超，翘角，塌角，玻浪型超标',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxtfw',
          title: '色点，杂质，混料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxffw',
          title: '二等色点，杂质，混料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxyfw',
          title: '表面分层，开裂，侧面分层，毛口',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxlfw',
          title: '色差，阴阳面，平整度',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxofw',
          title: '洞孔，釉粒，破釉，凹坑，喷釉不均，线条',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'qxpfw',
          title: '缺角，对角线',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
  ],
  footerData: [{ seq: '合计' }],
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
      return '原料';
    }
    case 2: {
      return '砖坯';
    }
    default: {
      return '未定义的类型';
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
  excelPathYLDay(params).then((data) => {
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
    <Card class="mb-8">
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
