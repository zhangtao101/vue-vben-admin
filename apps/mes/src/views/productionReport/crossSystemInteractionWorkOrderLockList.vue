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
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '工单号', minWidth: 190 },
    { field: 'workstationCode', title: '工作站编号', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'productName', title: '产品名称', minWidth: 150 },
    { field: 'planDateStart', title: '计划开始时间', minWidth: 150 },
    { field: 'workSheetPlanNumber', title: '工单计划数', minWidth: 150 },
    {
      field: 'workSheetFinishNumber',
      title: '工单完成数（入库数量）',
      minWidth: 180,
    },
    { field: 'planDateEnd', title: '预计完成时间', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    {
      field: 'state',
      fixed: 'right',
      slots: { default: 'workOrderStatus' },
      title: '工单状态',
      minWidth: 150,
    },
    {
      field: 'reportState',
      fixed: 'right',
      slots: { default: 'reportTheWorkStatus' },
      title: '工单报工状态',
      minWidth: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
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
      return '未生产';
    }
    case 1: {
      return '生产中';
    }
    case 2: {
      return '完工下线';
    }
    case 3: {
      return '暂停下线';
    }
    default: {
      return '未定义的状态';
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
      return '未报工';
    }
    case 2: {
      return '已报工';
    }
    default: {
      return '未定义的状态';
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
    cancelText: '取消',
    okText: '确认',
    okType: 'danger',
    onCancel() {
      // 点击取消按钮，显示警告消息
      message.warning('已取消!');
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
    title: '是否确认解除锁定?',
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
