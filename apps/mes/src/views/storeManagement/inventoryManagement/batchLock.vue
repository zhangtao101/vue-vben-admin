<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

import {Button, Card, Form, FormItem, Input, message, Modal, Select, Space} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {materialRecordBatchLock, materialRecordListBatchLock} from '#/api';
import { queryAuth } from '#/util';

// region 表格

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    {
      type: 'checkbox',
      width: 50,
    },
    { field: 'packingCode', title: '箱码', minWidth: 150 },
    { field: 'labelCode', title: '标签编码', minWidth: 150 },
    { field: 'materialCode', title: '物料料号', minWidth: 150 },
    { field: 'materialName', title: '物料名称', minWidth: 150 },
    { field: 'materialDescriptionId', title: '特征ID', minWidth: 150 },
    { field: 'number', title: '数量', minWidth: 150 },
    { field: 'unit', title: '单位', minWidth: 150 },
    { field: 'warehouseAreaCode', title: '所属储位', minWidth: 150 },
    { field: 'worksheetCode', title: '工单单号', minWidth: 150 },
    { field: 'batchCode', title: '批次号', minWidth: 150 },
    { field: 'lockTypeName', title: '锁定状态说明', minWidth: 150 },
  ],
  height: 500,
  stripe: true,
  sortConfig: {
    multiple: true,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
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

const gridEvents: any = {
  /* cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },*/
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

// 查询参数
const queryParams = ref<any>({});

/**
 * queryData - 负责根据当前的查询参数、分页信息和日期范围，从后端服务查询数据。
 * 该函数会更新表格的加载状态，并在查询完成后更新数据列表和总条数。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    // 构建查询参数对象，包含所有查询参数、当前页码和每页显示的数据条数。
    const params = {
      // 展开 queryParams.value 对象，包含所有查询参数。
      ...queryParams.value,
      // 设置当前页码。
      pageNum: page,
      // 设置每页显示的数据条数。
      pageSize,
    };

    // 调用 materialRecordListBatchLock 函数查询数据。
    materialRecordListBatchLock(params)
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

// region 解锁 / 锁定 / 标记

function lock(type: number) {
  const checkboxRecords = gridApi.grid.getCheckboxRecords();
  if (checkboxRecords.length > 0) {
    Modal.confirm({
      title: '是否确认操作!',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        materialRecordBatchLock({
          lockState: type,
          dtos: checkboxRecords,
        }).then(() => {
          gridApi.reload();
        });
      },
    });
  } else {
    message.error('请先选择数据!');
  }
}

// endregion

// region 初始化
// 路由信息
const route = useRoute();
// 当前页面按钮权限列表
const author = ref<string[]>([]);
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
        <!-- 批次 -->
        <FormItem
          :label="$t('storeManagement.batchLock.batch')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.batchCode" />
        </FormItem>
        <!-- 工单号 -->
        <FormItem
          :label="$t('storeManagement.batchLock.workOrderNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.worksheetCode" />
        </FormItem>
        <!-- 库位 -->
        <FormItem
          :label="$t('storeManagement.batchLock.warehouseLocation')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.locationCode" />
        </FormItem>
        <!-- 库区 -->
        <FormItem
          :label="$t('storeManagement.batchLock.reservoirArea')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.wareAreaCode" />
        </FormItem>
        <!-- 料号 -->
        <FormItem
          :label="$t('storeManagement.batchLock.partNumber')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.materialCode" />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                gridApi.reload();
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <Card class="mb-8">
      <Grid>
        <template #toolbar-tools>
          <Space>
            <Button type="primary" @click="lock(2)">
              {{ $t('storeManagement.batchLock.lock') }}
            </Button>
            <Button type="primary" @click="lock(1)">
              {{ $t('storeManagement.batchLock.unlock') }}
            </Button>
            <Button type="primary" @click="lock(3)">
              {{ $t('storeManagement.batchLock.tag') }}
            </Button>
          </Space>
        </template>
      </Grid>
    </Card>
  </Page>
</template>

<style scoped lang="scss">
.test {
  label {
    display: inline-block;
    margin: 1em 0;
  }
}
</style>
