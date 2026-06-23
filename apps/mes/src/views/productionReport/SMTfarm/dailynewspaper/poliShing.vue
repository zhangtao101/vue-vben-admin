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
import { queryEnamelDayStatistics } from '#/api';
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
    { field: 'day', title: $t('productionDaily.CodeProduct_1'), minWidth: 200 },
    { field: 'worksheetCode', title: $t('productionDaily.Product'), minWidth: 200 },
    { field: 'lineName', title: $t('productionDaily.Spec_1'), minWidth: 200 },
    { field: 'productCode', title: $t('productionDaily.batchClosingStatus'), minWidth: 200 },
    { field: 'materialName', title: $t('productionDaily.Input'), minWidth: 200 },
    { field: 'reportNumber', title: $t('productionDaily.Output'), minWidth: 200 },
    { field: 'qualityNumber', title: $t('productionDaily.PreBrokenTotal'), minWidth: 200 },
    {
      title: $t('productionDaily.InboundRate'),
      children: [
        { field: 'dlValue', title: $t('productionDaily.target'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Actual'), minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.PreBrokenTotalInputBrokenRate'),
      children: [
        { field: 'dlValue', title: $t('productionDaily.Total'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Kiln'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Polish'), minWidth: 150 },
      ],
    },
    { field: 'qualityNumber', title: $t('productionDaily.InputOutputActual'), minWidth: 200 },
    {
      title: $t('productionDaily.InboundDefectRate'),
      children: [
        { field: 'dlValue', title: $t('productionDaily.T_8'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.patternPW'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Glaze'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Pit'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.hole'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Scratch'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.bottomLeak'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.flatnessExceeded_1'), minWidth: 150 },
        { field: 'jlqValue', title: 'OA/OB', minWidth: 150 },
        { field: 'jlqValue', title: 'OBQ', minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Scrap'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.pendingStatus'), minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.PreBroken_1'),
      children: [
        { field: 'dlValue', title: $t('productionDaily.Kiln'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Polish'), minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.Inbound_2'),
      children: [
        { field: 'dlValue', title: $t('productionDaily.T_8'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.patternPW'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Glaze'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Pit'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.hole'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Scratch'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.bottomLeak'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.flatnessExceeded_1'), minWidth: 150 },
        { field: 'jlqValue', title: 'OA/OB', minWidth: 150 },
        { field: 'jlqValue', title: 'OBQ', minWidth: 150 },
      ],
    },
    {
      title: $t('productionDaily.Scrap'),
      children: [
        { field: 'dlValue', title: 'PT', minWidth: 150 },
        { field: 'jlqValue', title: 'OAW', minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Glaze'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Pit'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.hole'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.Scratch'), minWidth: 150 },
        { field: 'jlqValue', title: $t('productionDaily.bottomLeak'), minWidth: 150 },
        { field: 'jlqValue', title: 'OAE', minWidth: 150 },
        { field: 'jlqValue', title: 'OA/OB', minWidth: 150 },
        { field: 'jlqValue', title: 'OBQ', minWidth: 150 },
        { field: 'jlqValue', title: 'OBJ', minWidth: 150 },
      ],
    },
    { field: 'qualityNumber', title: $t('productionDaily.pendingStatus'), minWidth: 200 },
  ],
  footerData: [{ seq: $t('productionDaily.total') }],
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
    queryEnamelDayStatistics({
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
