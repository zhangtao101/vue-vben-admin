<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch, MdiUpdate } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  callbackInout,
  getInWarehouseHistoryList,
} from '#/api/productionReport/packagingAndInventoryReversal.service';
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
    { field: 'code', title: '入库单号', minWidth: 200 },
    { field: 'worksheetCode', title: '工单号', minWidth: 200 },
    { field: 'batchCode', title: '入库批次号', minWidth: 200 },
    { field: 'warehouseCode', title: '库位', minWidth: 200 },
    { field: 'number', title: '入库数量', minWidth: 200 },
    { field: 'packageNumber', title: '包装箱数', minWidth: 200 },
    { field: 'opTime', title: '入库时间', minWidth: 200 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      minWidth: 120,
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
 * 冲销
 * @param row
 */
function chargeAgainst(row: any) {
  callbackInout({
    recordId: row.id,
  }).then(({ code }) => {
    if (code === 200) {
      message.success('冲销成功');
      gridApi.reload();
    } else {
      message.error('冲销失败');
    }
  });
}

// endregion

// region 查询数据
// 查询参数
const queryParams = ref({
  // 工单号
  worksheetCode: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    getInWarehouseHistoryList({
      ...queryParams.value, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then((data) => {
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
        <template #action="{ row }">
          <!-- 冲红 -->
          <Tooltip>
            <template #title>
              {{ $t('common.flushRed') }}
            </template>
            <Button
              :icon="h(MdiUpdate, { class: 'inline-block size-6' })"
              :loading="row.loading"
              class="mr-4"
              type="link"
              @click="chargeAgainst(row)"
              v-if="author.includes('冲销')"
            />
          </Tooltip>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
