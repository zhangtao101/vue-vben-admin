<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, RangePicker } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { excelPathYXStopHZStatistics, queryYXStopHZStatistics } from '#/api';
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
    { field: 'month', title: '日期', minWidth: 200 },
    { field: 'lineName', title: '线号', minWidth: 200 },
    { field: 'typeName', title: '类型', minWidth: 200 },
    { field: 'stopTime', title: '停机时间合计', minWidth: 200 },
    { field: 'stopValue', title: '停机燃气', minWidth: 200 },
    {
      title: '工艺停产',
      children: [
        { field: 'gytcdb', title: '打包', minWidth: 150 },
        { field: 'gytcdbnh', title: '打包能耗', minWidth: 150 },
        { field: 'gytcpg', title: '抛光', minWidth: 150 },
        { field: 'gytcpgnh', title: '抛光能耗', minWidth: 150 },
        { field: 'gytcsc', title: '窑炉', minWidth: 150 },
        { field: 'gytcscnh', title: '窑炉能耗', minWidth: 150 },
        { field: 'sctcsy', title: '施釉', minWidth: 150 },
        { field: 'gytcsynh', title: '施釉能耗', minWidth: 150 },
        { field: 'gytcwg', title: '卧干', minWidth: 150 },
        { field: 'gytcwgnh', title: '卧干能耗', minWidth: 150 },
        { field: 'gytccx', title: '成型', minWidth: 150 },
        { field: 'gytccxnh', title: '成型能耗', minWidth: 150 },
        { field: 'gytcyl', title: '原料', minWidth: 150 },
        { field: 'gytcylnh', title: '原料能耗', minWidth: 150 },
      ],
    },
    {
      title: '生产停产',
      children: [
        { field: 'sctcdb', title: '打包', minWidth: 150 },
        { field: 'sctcdbnh', title: '打包能耗', minWidth: 150 },
        { field: 'sctcpg', title: '抛光', minWidth: 150 },
        { field: 'sctcpgnh', title: '抛光能耗', minWidth: 150 },
        { field: 'sctcsc', title: '窑炉', minWidth: 150 },
        { field: 'sctcscnh', title: '窑炉能耗', minWidth: 150 },
        { field: 'sctcsy', title: '施釉', minWidth: 150 },
        { field: 'sctcsynh', title: '施釉能耗', minWidth: 150 },
        { field: 'sctcwg', title: '卧干', minWidth: 150 },
        { field: 'sctcwgnh', title: '卧干能耗', minWidth: 150 },
        { field: 'sctccx', title: '成型', minWidth: 150 },
        { field: 'sctccxnh', title: '成型能耗', minWidth: 150 },
        { field: 'sctcyl', title: '原料', minWidth: 150 },
        { field: 'sctcylnh', title: '原料能耗', minWidth: 150 },
      ],
    },
    {
      title: '设备故障',
      children: [
        { field: 'sbgzdb', title: '打包', minWidth: 150 },
        { field: 'sbgzdbn', title: '打包能耗', minWidth: 150 },
        { field: 'sbgzpg', title: '抛光', minWidth: 150 },
        { field: 'sbgzpgnh', title: '抛光能耗', minWidth: 150 },
        { field: 'sbgzyl', title: '窑炉', minWidth: 150 },
        { field: 'sbgzylnh', title: '窑炉能耗', minWidth: 150 },
        { field: 'sbgzyx', title: '施釉', minWidth: 150 },
        { field: 'sbgzyxnh', title: '施釉能耗', minWidth: 150 },
        { field: 'sbgzsg', title: '卧干', minWidth: 150 },
        { field: 'sbgzsgnh', title: '卧干能耗', minWidth: 150 },
        { field: 'sbgzcx', title: '成型', minWidth: 150 },
        { field: 'sbgzcxnh', title: '成型能耗', minWidth: 150 },
        { field: 'sbgzfz', title: '原料', minWidth: 150 },
        { field: 'sbgzfznh', title: '原料能耗', minWidth: 150 },
      ],
    },
    { field: 'sczc', title: '转产', minWidth: 150 },
    { field: 'sczcn', title: '转产能耗', minWidth: 150 },
    { field: 'cnxz', title: '产能限制', minWidth: 150 },
    { field: 'cnxznh', title: '产能限制能耗', minWidth: 150 },
    { field: 'zrzh', title: '自然灾害', minWidth: 150 },
    { field: 'zrzhnh', title: '自然灾害能耗', minWidth: 150 },
    { field: 'sbqx', title: '设备清洗', minWidth: 150 },
    { field: 'sbqxnh', title: '设备清洗能耗', minWidth: 150 },
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
    queryYXStopHZStatistics({
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
  excelPathYXStopHZStatistics(params).then((data) => {
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
