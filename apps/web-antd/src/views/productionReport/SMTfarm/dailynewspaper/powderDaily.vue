<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryYLReportDayStatistics } from '#/api';
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
    { field: 'productCode', title: '产品编号', minWidth: 200 },
    {
      title: '配方',
      children: [{ field: 'productName', title: '编号', minWidth: 150 }],
    },
    {
      field: 'planNumber',
      title: '计划批量(万M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '球磨机',
      children: [
        {
          field: 'feedNumber',
          title: '加料量(T)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '平浆池',
      children: [
        {
          field: 'pjInNumber',
          title: '放浆量(T)',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '喷干量(T)',
      children: [
        { field: 'equipName', title: '塔号', minWidth: 150 },
        { field: 'pfCurrentTime', title: '喷干时间', minWidth: 150 },
        {
          field: 'dayInNumber',
          title: '当日',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'zfOutNumber',
          title: '批累计',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '天然气用量(M3)',
      children: [
        {
          field: 'trquseEnergyNumber',
          title: '耗量',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'perUseNumber',
          title: '单耗M3/T',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        { field: 'trqstartEnergyNumber', title: '开始读数', minWidth: 200 },
        { field: 'trqendEnergyNumber', title: '结束读数', minWidth: 200 },
      ],
    },
    {
      title: '焦炉气用量(M3)',
      children: [
        {
          field: 'jlquseEnergyNumber',
          title: '耗量',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'jlqperUseNumber',
          title: '单耗M3/T',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        { field: 'jlqstartEnergyNumber', title: '开始读数', minWidth: 200 },
        { field: 'jlqendEnergyNumber', title: '结束读数', minWidth: 200 },
      ],
    },
    {
      title: '水煤浆用量(M3)',
      children: [
        {
          field: 'smjuseEnergyNumber',
          title: '耗量',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'smjperUseNumber',
          title: '单耗M3/T',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        { field: 'smjstartEnergyNumber', title: '开始读数', minWidth: 200 },
        { field: 'smjendEnergyNumber', title: '结束读数', minWidth: 200 },
      ],
    },
    {
      field: 'currentTime',
      title: '喷干用时（小时）',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'perOutput',
      title: '单位产能（吨/小时）',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '电耗量',
      children: [
        {
          field: 'dluseEnergyNumber',
          title: '耗量',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'dlperUseNumber',
          title: '单耗M3/T',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        { field: 'dlstartEnergyNumber', title: '开始读数', minWidth: 150 },
        { field: 'dlendEnergyNumber', title: '结束读数', minWidth: 150 },
      ],
    },
  ],
  footerData: [{ seq: '合计' }],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 4 }],
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
    queryYLReportDayStatistics({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ dayStatisticsDtos: { total, list }, ...p }) => {
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
            :icon="h(MaterialSymbolsSearch, { class: 'inline-block mr-2' })"
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
        <template #footerData="{ column }">
          <span> {{ collect[column.field] }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
