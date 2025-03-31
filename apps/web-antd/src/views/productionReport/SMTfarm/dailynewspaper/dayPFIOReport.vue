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
  excelPathMonthPolishPressInOutPut,
  queryExcelPathMonthPolishPressInOutPut,
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
      title: '序号',
      type: 'seq',
      field: 'seq',
      width: 50,
    },
    {
      field: 'lineName',
      title: '生产线',
      minWidth: 200,
    },
    { field: 'startday', title: '开始日期', minWidth: 120 },
    {
      field: 'endday',
      title: '结束日期',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'materialCode',
      title: '投入编号',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'dp',
      title: '领用待抛库',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sumLl',
      title: '领料合计',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'outProductCode',
      title: '产出编号',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'PA',
      title: 'PA',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'PAl',
      title: 'PA率',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'One',
      title: '1等品',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'Onel',
      title: '1等品率',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sum',
      title: '入库合计',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'sumLc',
      title: '损耗合计',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'Lcl',
      title: '损耗率',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'color',
      title: '色号',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'maxColor',
      title: 'PA最大色号',
      minWidth: 120,
      slots: { footer: 'footerData' },
    },
    {
      field: 'colorl',
      title: 'PA一色集中率',
      minWidth: 120,
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
  // 投入编号
  productCode: '',
  // 生产线
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
    queryExcelPathMonthPolishPressInOutPut({
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
  excelPathMonthPolishPressInOutPut(params).then((data) => {
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

        <!-- 投入编号 -->
        <FormItem
          :label="$t('productionDaily.inputNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 生产线 -->
        <FormItem
          :label="$t('productionDaily.productionLine')"
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
