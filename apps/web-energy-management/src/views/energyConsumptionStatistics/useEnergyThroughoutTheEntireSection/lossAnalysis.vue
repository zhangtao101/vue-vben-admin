<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MaterialSymbolsSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'worksheetCode', title: '线损对象名称', minWidth: 200 },
    { field: 'batchCode', title: '统计周期', minWidth: 200 },
    { field: 'productCode', title: '统计时间', minWidth: 150 },
    { field: 'productName', title: '线损率(%)', minWidth: 150 },
    { field: 'workstationCode', title: '供入电量(kWh)', minWidth: 150 },
    { field: 'workstationName', title: '供入明细完整率(%)', minWidth: 150 },
    { field: 'processCode', title: '供出电量(kWh)', minWidth: 150 },
    { field: 'processName', title: '供出明细完整率(%)', minWidth: 150 },
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
  //  工序编号
  processCode: '',
  // 工作站编号
  workstationCode: '',
  // 工作站名称
  workstationName: '',
  // 工单号
  worksheetCode: '',
  // 产品料号
  productCode: '',
  // 产品名称
  productName: '',
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 * { page, pageSize }: any
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    resolve({
      total: 0,
      items: [],
    });
    /* queryProductionDaily({
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
      });*/
  });
}

// endregion

// region 权限查询
// 当前页面按钮权限列表
// const author = ref<string[]>([]);

// endregion

// region 初始化

onMounted(() => {
  // 查询权限
  /* queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });*/
});

// endregion
</script>

<template>
  <Page>
    <!-- region 搜索 -->
    <Card class="mb-8">
      <Form :model="queryParams" layout="inline">
        <!-- 对象名称 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.objectName')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.processCode" />
        </FormItem>
        <!-- 统计周期 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.statisticalPeriod')"
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.processCode" />
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
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
