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
import { checkThePowerStatistics } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'area', title: '系统名称', minWidth: 150 },
    { field: 'energyTotal', title: '使用总能耗', minWidth: 150 },
    { field: 'energyWork', title: '生产能耗', minWidth: 150 },
    { field: 'energyNoWork', title: '非生产能耗', minWidth: 150 },
    { field: 'createTime', title: '创建时间', minWidth: 150 },
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

// endregion

// region 查询数据
// 查询参数
const queryParams = ref<any>({
  // 查询时间范围 - 用户选择的时间段
  searchTime: [] as any,
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, _reject) => {
    const params = {
      ...queryParams.value,
    };
    // 处理时间范围参数
    if (params.searchTime && params.searchTime.length > 0) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD 00:00:00');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD 23:59:59');
      delete params.searchTime;
    }
    /**
     * 调用 queryTheEnergyConsumptionOfASingleProduct 函数，传入查询参数和分页信息。
     * 查询参数包括 params 中的所有属性，以及当前页码和每页大小。
     */
    checkThePowerStatistics({
      ...params,
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
      .catch(() => {
        resolve({
          total: 0,
          items: [],
        });
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
        <!-- 系统名称 -->
        <FormItem
          :label="$t('basic.productBom.systemName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.area" />
        </FormItem>
        <!-- 时间范围选择器 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionStatistics.timeFrame')"
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
      <Grid />
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
