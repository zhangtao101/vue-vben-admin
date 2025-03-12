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
import { queryPGStopDayStatistics } from '#/api';
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
    { field: 'type', title: '类型', minWidth: 200 },
    { field: 'materialName', title: '产品名称', minWidth: 200 },
    { field: 'productCode', title: '产品编码', minWidth: 200 },
    { field: 'lineName', title: '线号', minWidth: 200 },
    { field: 'mBNumber', title: '磨边产量', minWidth: 200 },
    { field: 'pGNumber', title: '抛光产量', minWidth: 200 },
    { field: 'stopTime', title: '停机时间合计(h)', minWidth: 200 },
    {
      title: '工艺停机',
      children: [
        {
          field: 'gYTCDB',
          title: '打包',
          minWidth: 150,
        },
        {
          field: 'gYTCPG',
          title: '抛光',
          minWidth: 150,
        },
        {
          field: 'gYTCSC',
          title: '窑炉',
          minWidth: 150,
        },
        {
          field: 'gYTCSY',
          title: '施釉',
          minWidth: 150,
        },
        {
          field: 'gYTCWG',
          title: '卧干',
          minWidth: 150,
        },
        {
          field: 'gYTCCX',
          title: '成型',
          minWidth: 150,
        },
        {
          field: 'gYTCYL',
          title: '原料',
          minWidth: 150,
        },
      ],
    },
    {
      title: '生产停机',
      children: [
        {
          field: 'sCTCDB',
          title: '打包',
          minWidth: 150,
        },
        {
          field: 'sCTCPG',
          title: '抛光',
          minWidth: 150,
        },
        {
          field: 'sCTCSC',
          title: '窑炉',
          minWidth: 150,
        },
        {
          field: 'sCTCSY',
          title: '施釉',
          minWidth: 150,
        },
        {
          field: 'sCTCWG',
          title: '卧干',
          minWidth: 150,
        },
        {
          field: 'sCTCYL',
          title: '原料',
          minWidth: 150,
        },
        {
          field: 'sCTCCX',
          title: '成型',
          minWidth: 150,
        },
      ],
    },
    {
      title: '设备故障',
      children: [
        {
          field: 'sBGZDB',
          title: '打包',
          minWidth: 150,
        },
        {
          field: 'sBGZPG',
          title: '抛光',
          minWidth: 150,
        },
        {
          field: 'sBGZYL',
          title: '窑炉',
          minWidth: 150,
        },
        {
          field: 'sBGZYX',
          title: '施釉',
          minWidth: 150,
        },
        {
          field: 'sBGZSG',
          title: '卧干',
          minWidth: 150,
        },
        {
          field: 'sBGZFZ',
          title: '原料',
          minWidth: 150,
        },
        {
          field: 'sBGZCX',
          title: '成型',
          minWidth: 150,
        },
      ],
    },
    { field: 'sCZC', title: '转产', minWidth: 200 },
    { field: 'cNXZ', title: '产能限制', minWidth: 200 },
    { field: 'zRZH', title: '自然灾害', minWidth: 200 },
    { field: 'sBQX', title: '设备清洗', minWidth: 200 },
  ],
  footerData: [{ seq: '抛光汇总' }, { seq: '磨边胡总' }, { seq: '合计' }],
  mergeFooterItems: [
    { row: 0, col: 0, rowspan: 1, colspan: 2 },
    { row: 1, col: 0, rowspan: 1, colspan: 2 },
    { row: 2, col: 0, rowspan: 1, colspan: 2 },
  ],
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
  // 线号
  lineName: '',
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
    queryPGStopDayStatistics({
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
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productionDaily.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>

        <!-- 线号 -->
        <FormItem
          :label="$t('productionDaily.wireNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
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
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
