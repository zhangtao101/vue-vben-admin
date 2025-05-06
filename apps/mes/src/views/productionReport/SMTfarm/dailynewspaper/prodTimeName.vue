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
import { excelPathBHZInProductionTime, queryBHZInProductionTime } from '#/api';
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
    { field: 'startDay', title: '开始日期', minWidth: 200 },
    { field: 'endDay', title: '结束日期', minWidth: 200 },
    { field: 'batchCode', title: '生产批号', minWidth: 200 },
    { field: 'lineName', title: '窑号', minWidth: 200 },
    { field: 'productCode', title: '产品编码', minWidth: 200 },
    {
      field: 'sctime',
      title: '烧成时间',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '工艺停产',
      children: [
        {
          field: 'gytcdb',
          title: '打包',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcpg',
          title: '抛光',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcsc',
          title: '窑炉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsy',
          title: '施釉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcwg',
          title: '卧干',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytccx',
          title: '成型',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'gytcyl',
          title: '原料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '生产停产',
      children: [
        {
          field: 'sctcdb',
          title: '打包',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcpg',
          title: '抛光',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsc',
          title: '窑炉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcsy',
          title: '施釉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcwg',
          title: '卧干',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctccx',
          title: '成型',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sctcyl',
          title: '原料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      title: '设备故障',
      children: [
        {
          field: 'sbgzdb',
          title: '打包',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzpg',
          title: '抛光',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzyl',
          title: '窑炉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzyx',
          title: '施釉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzsg',
          title: '卧干',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzcx',
          title: '成型',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: 'sbgzfz',
          title: '原料',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: 'sczc',
      title: '转产',
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'cnxz',
      title: '产能限制',
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'zrzh',
      title: '自然灾害',
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sbqx',
      title: '设备清洗',
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
    {
      field: 'xj',
      title: '停机时间小计',
      minWidth: 150,
      slots: { footer: 'footerData' },
    },
  ],
  footerData: [{ seq: '合计' }],
  mergeFooterItems: [{ row: 0, col: 0, rowspan: 1, colspan: 6 }],
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
  // 窑号
  YHName: '',
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
    queryBHZInProductionTime({
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
  excelPathBHZInProductionTime(params).then((data) => {
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
    <Card class="mb-8">
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
        <!-- 窑号 -->
        <FormItem
          :label="$t('productionDaily.kilnNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.YHName" />
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
