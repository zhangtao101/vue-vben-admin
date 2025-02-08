<script setup lang="ts">
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { searchWorkSheetFinishSituation } from '#/api';
import { queryAuth } from '#/util';
import ApplyForWork from '#/util/component/applyForWork.vue';

// region 表格
const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      field: 'workSheetCode',
      slots: { default: 'workSheetCode' },
      title: '工单号',
      minWidth: 220,
    },
    { field: 'lineName', title: '工单批次号', minWidth: 150 },
    { field: 'processName', title: '报工工序', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 200 },
    { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 150 },
    { field: 'workSheetFinishNumber', title: '工单完成数', minWidth: 150 },
    { field: 'sideNo', title: '工单结束时间', minWidth: 150 },
    { field: 'planDateStart', title: '工单计划开始时间', minWidth: 150 },
  ],
  height: 300,
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
  workSheetCode: undefined,
  productName: undefined,
});

/**
 * 从服务器查询工作站数据的函数。
 * 这个函数用于发送查询请求，并在成功获取数据后更新组件的状态。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params = {
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    };
    if (params.timeFrame && params.timeFrame.length === 2) {
      params.startDate = params.timeFrame[0].format('YYYY-MM-DD');
      params.endDate = params.timeFrame[0].format('YYYY-MM-DD');
      params.timeFrame = undefined;
    }
    /**
     * 调用 queryWorkstation 函数，传入查询参数和分页信息。
     * 查询参数包括 queryParams.value 中的所有属性，以及当前页码和每页大小。
     */
    searchWorkSheetFinishSituation(params)
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

// region 编辑
const editItemWorkSheetCode = ref<string>('');

function showEdit(row: any) {
  editItemWorkSheetCode.value = row.workSheetCode;
}

// endregion

// 路由信息
const route = useRoute();
const author = ref<string[]>([]);
// 冲红
onMounted(() => {
  // 查询权限
  queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });
});
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 时间范围 -->
        <FormItem
          :label="$t('productRed.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.timeFrame" />
        </FormItem>
        <!-- 工单编号 -->
        <FormItem
          :label="$t('productRed.theTicketNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.workSheetCode" />
        </FormItem>
        <!-- 产品名称 -->
        <FormItem
          :label="$t('productRed.productName')"
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
        <template #workSheetCode="{ row }">
          <Button class="mr-4" type="link" @click="showEdit(row)">
            {{ row.workSheetCode }}
          </Button>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
    <ApplyForWork
      :work-sheet-code="editItemWorkSheetCode"
      :operation="author.includes('冲红')"
    />
  </Page>
</template>

<style scoped></style>
