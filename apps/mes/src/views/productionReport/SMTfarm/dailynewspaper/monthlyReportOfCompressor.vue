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
import { excelPathPressMonth, queryPressMonthStatistics } from '#/api';
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
    { field: 'month', title: '月份', minWidth: 200 },
    { field: 'startDay', title: '开始日期', minWidth: 200 },
    { field: 'endDay', title: '结束日期', minWidth: 200 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'equipCode', title: '压机编号', minWidth: 200 },
    { field: 'lineName', title: '生产批次号', minWidth: 200 },
    { field: 'productCode', title: '产品编码', minWidth: 200 },
    { field: 'materialName', title: '产品名称', minWidth: 200 },
    {
      field: 'usePowderNumber',
      title: '粉料用量(T)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wasteMaterialNumber',
      title: '废粉量T(T)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'pressingWeightNumber',
      title: '压制量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'odryBilletWeight',
      title: '干坯重量(KG/M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgInNumber',
      title: '卧干入库量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'wgInWeight',
      title: '卧干投入量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'centosRate',
      title: '投入产出率',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'equipTime',
      title: '工时',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlValue',
      title: '电耗',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trqValue',
      title: '天然气',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dlStopValue',
      title: '停机电耗',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: 'trqStopValue',
      title: '停机天然气能耗',
      minWidth: 200,
      slots: { footer: 'footerData' },
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
  // 工单号
  worksheetCode: '',
  // 产品编码
  productCode: '',
  // 产品名称
  materialName: '',
  // 生产批次号
  lineName: '',
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
    queryPressMonthStatistics({
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
  excelPathPressMonth(params).then((data) => {
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

        <!-- 工单号 -->
        <FormItem
          :label="$t('productionDaily.worksheetCode')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
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

        <!-- 批次号 -->
        <FormItem
          :label="$t('productionDaily.batchNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.lineName" />
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
