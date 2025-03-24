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
import { excelPathYLDay, queryYLDayStatistics } from '#/api';
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
      fixed: 'left',
    },
    {
      field: '',
      title: '生产日期（开始-结束时间）',
      minWidth: 200,
      fixed: 'left',
    },
    { field: '', title: '生产批号', minWidth: 120, fixed: 'left' },
    { field: '', title: '窑号', minWidth: 120, fixed: 'left' },
    { field: '', title: '产品编号', minWidth: 120, fixed: 'left' },
    {
      field: '',
      title: '期初盘存(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '粉料用量(T)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '废粉(T)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '压制量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '装载量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '进窑量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '出窑量(M2)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '装载(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '卸载(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '出窑(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '出窑/压制(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '入库/压制(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '入待抛砖库JP（M2）',
      children: [
        {
          field: '',
          title: 'P^',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '',
          title: 'P%',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '',
          title: '小计',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: '',
      title: '入库合计（M2）',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '报废熟砖',
      children: [
        {
          field: '',
          title: '片',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '',
          title: 'M2',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '',
          title: '%',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: '',
      title: '抛光上砖前损耗',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '总损耗(%)',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      field: '',
      title: '期末盘存',
      minWidth: 200,
      slots: { footer: 'footerData' },
    },
    {
      title: '天燃气（M3）',
      children: [
        {
          field: '',
          title: '卧干器',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
        {
          field: '',
          title: '窑炉',
          minWidth: 150,
          slots: { footer: 'footerData' },
        },
      ],
    },
    {
      field: '',
      title: '停窑燃气',
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
    queryYLDayStatistics({
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
