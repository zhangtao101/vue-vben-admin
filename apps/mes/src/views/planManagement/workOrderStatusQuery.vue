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
  Select,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listWorkstationType, queryWorksheetState } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// 路由信息
const route = useRoute();

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: $t('page.common.serialNumber'), type: 'seq', width: 50 },
    { field: 'worksheetCode', title: $t('planManagement.workOrderNumber'), minWidth: 190 },
    { field: 'workstationCode', title: $t('planManagement.workStationNumber'), minWidth: 150 },
    { field: 'productCode', title: $t('baseInfo.productCode'), minWidth: 150 },
    { field: 'productName', title: $t('baseInfo.productName'), minWidth: 150 },
    { field: 'planDateStart', title: $t('planManagement.planStartTime'), minWidth: 150 },
    { field: 'workSheetPlanNumber', title: $t('planManagement.workOrderPlanQuantity'), minWidth: 150 },
    {
      field: 'workSheetFinishNumber',
      title: $t('planManagement.workOrderCompletedQuantity'),
      minWidth: 180,
    },
    { field: 'planDateEnd', title: $t('planManagement.estimatedCompletionTime'), minWidth: 150 },
    { field: 'unit', title: $t('baseInfo.unit'), minWidth: 150 },
    {
      field: 'state',
      fixed: 'right',
      slots: { default: 'workOrderStatus' },
      title: $t('planManagement.workOrderStatus'),
      minWidth: 150,
    },
    {
      field: 'reportState',
      fixed: 'right',
      slots: { default: 'reportTheWorkStatus' },
      title: $t('planManagement.workOrderReportStatus'),
      minWidth: 150,
    },
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

/**
 * 获取状态的中文描述
 * @param state 状态编码
 */
function getStatusText(state: number) {
  switch (state) {
    case -1: {
      return $t('planManagement.notProduced');
    }
    case 1: {
      return $t('planManagement.inProduction');
    }
    case 2: {
      return $t('planManagement.productionCompleted');
    }
    case 3: {
      return $t('planManagement.productionPaused');
    }
    default: {
      return $t('planManagement.undefinedStatus');
    }
  }
}
/**
 * 获取报工状态的中文描述
 * @param state 状态编码
 */
function getReportStateText(state: number) {
  switch (state) {
    case 1: {
      return $t('planManagement.notReported');
    }
    case 2: {
      return $t('planManagement.reported');
    }
    default: {
      return $t('planManagement.undefinedStatus');
    }
  }
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 查询时间
  searchTime: [] as any,
  // 产品编号
  productCode: '',
  // 产品名称
  productName: '',
  // 工单号
  worksheetCode: '',
  // 类型
  workstationType: 1,
  // 工单状态
  state: '',
  // 工单报工状态
  reportState: '',
});

// 工作站类别
const workstationTypes = ref<any>([]);
// 查询工作站类别
function queryType() {
  listWorkstationType().then((data) => {
    workstationTypes.value = data;
    queryParams.value.workstationType = data[0].value;
    gridApi.reload();
  });
}
/**
 * 状态类型
 */
const statusTypes = ref([
  {
    label: $t('planManagement.notProduced'),
    value: -1,
  },
  {
    label: $t('planManagement.inProduction'),
    value: 1,
  },
  {
    label: $t('planManagement.productionCompleted'),
    value: 2,
  },
  {
    label: $t('planManagement.productionPaused'),
    value: 3,
  },
]);
/**
 * 报工状态类型
 */
const reportStatusTypes = ref([
  {
    label: $t('planManagement.notReported'),
    value: 1,
  },
  {
    label: $t('planManagement.reported'),
    value: 2,
  },
]);

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
    if (params.workstationType) {
      queryWorksheetState({
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
    } else {
      resolve({
        total: 0,
        items: [],
      });
    }
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
  queryType();
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="!mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 类别 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workstationType')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.workstationType"
            :options="workstationTypes"
            class="!w-64"
          />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.queryTime')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.searchTime" />
        </FormItem>
        <!-- 产品编号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.productNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productCode" />
        </FormItem>

        <!-- 产品名称 -->
        <FormItem
          :label="$t('workOrderStatusQuery.productName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.productName" />
        </FormItem>

        <!-- 工单号 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workOrderNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>

        <!-- 工单状态 -->
        <FormItem
          :label="$t('workOrderStatusQuery.workOrderStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.state"
            :options="statusTypes"
            class="!w-64"
            allow-clear
          />
        </FormItem>
        <!-- 工单报工状态 -->
        <FormItem
          :label="$t('workOrderStatusQuery.reportTheWorkStatus')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.reportState"
            :options="reportStatusTypes"
            class="!w-64"
            allow-clear
          />
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
        <template #toolbar-tools></template>
        <template #workOrderStatus="{ row }">
          <span> {{ getStatusText(row.state) }} </span>
        </template>
        <template #reportTheWorkStatus="{ row }">
          <span>{{ getReportStateText(row.reportState) }}</span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
