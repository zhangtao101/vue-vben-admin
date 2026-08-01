<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  RangePicker,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listByParam, unLockByWorksheetCode } from '#/api';
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
    { field: 'worksheetCode', title: $t('crossSystemInteractionWorkOrderLockList.worksheetCode'), minWidth: 190 },
    { field: 'workstationCode', title: $t('crossSystemInteractionWorkOrderLockList.workstationCode'), minWidth: 150 },
    { field: 'productCode', title: $t('crossSystemInteractionWorkOrderLockList.productCode'), minWidth: 150 },
    { field: 'productName', title: $t('crossSystemInteractionWorkOrderLockList.productName'), minWidth: 150 },
    { field: 'planDateStart', title: $t('crossSystemInteractionWorkOrderLockList.planStartTime'), minWidth: 150 },
    { field: 'workSheetPlanNumber', title: $t('crossSystemInteractionWorkOrderLockList.planNumber'), minWidth: 150 },
    {
      field: 'workSheetFinishNumber',
      title: $t('crossSystemInteractionWorkOrderLockList.completedQuantity'),
      minWidth: 180,
    },
    { field: 'planDateEnd', title: $t('crossSystemInteractionWorkOrderLockList.estimatedCompletionTime'), minWidth: 150 },
    { field: 'unit', title: $t('crossSystemInteractionWorkOrderLockList.unit'), minWidth: 150 },
    {
      field: 'state',
      fixed: 'right',
      slots: { default: 'workOrderStatus' },
      title: $t('crossSystemInteractionWorkOrderLockList.workOrderStatus'),
      minWidth: 150,
    },
    {
      field: 'reportState',
      fixed: 'right',
      slots: { default: 'reportTheWorkStatus' },
      title: $t('crossSystemInteractionWorkOrderLockList.reportStatus'),
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('crossSystemInteractionWorkOrderLockList.action'),
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
      query: async () => {
        return await queryData();
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
      return $t('crossSystemInteractionWorkOrderLockList.notProduced');
    }
    case 1: {
      return $t('crossSystemInteractionWorkOrderLockList.inProduction');
    }
    case 2: {
      return $t('crossSystemInteractionWorkOrderLockList.productionCompleted');
    }
    case 3: {
      return $t('crossSystemInteractionWorkOrderLockList.productionPaused');
    }
    default: {
      return $t('crossSystemInteractionWorkOrderLockList.undefinedStatus');
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
      return $t('crossSystemInteractionWorkOrderLockList.notReported');
    }
    case 2: {
      return $t('crossSystemInteractionWorkOrderLockList.reported');
    }
    default: {
      return $t('crossSystemInteractionWorkOrderLockList.undefinedStatus');
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
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData() {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    listByParam({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
    })
      .then((data) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total: data.length,
          items: data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 解除绑定
 * @param row
 */
function unlock(row: any) {
  // 弹出确认对话框
  Modal.confirm({
    cancelText: $t('common.cancel'),
    okText: $t('common.confirm'),
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning($t('crossSystemInteractionWorkOrderLockList.cancelPrompt'));
    },
    onOk() {
      unLockByWorksheetCode({
        worksheetCode: row.worksheetCode,
      }).then(() => {
        // 显示操作成功消息
        message.success($t('common.successfulOperation'));
        gridApi.reload();
      });
    },
    title: $t('crossSystemInteractionWorkOrderLockList.confirmUnlock'),
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
        <!-- 查询时间 -->
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
        <template #action="{ row }">
          <!-- 解除锁定 -->
          <Tooltip v-if="author.includes('解除锁定')">
            <template #title>
              {{ $t('crossSystemInteractionWorkOrderLockList.unlock') }}
            </template>
            <Button type="link" @click="unlock(row)">
              <Icon
                icon="ep:unlock"
                class="inline-block align-middle text-2xl"
              />
            </Button>
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
