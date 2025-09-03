<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import { Button, Card, Form, FormItem, Input } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

// region 表格操作

// 表格配置项
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中
  border: true, // 显示边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
    { field: 'worksheetCode', title: '线损对象名称', minWidth: 200 }, // 线损对象名称列
    { field: 'batchCode', title: '统计周期', minWidth: 200 }, // 统计周期列
    { field: 'productCode', title: '统计时间', minWidth: 150 }, // 统计时间列
    { field: 'productName', title: '线损率(%)', minWidth: 150 }, // 线损率列
    { field: 'workstationCode', title: '供入电量(kWh)', minWidth: 150 }, // 供入电量列
    { field: 'workstationName', title: '供入明细完整率(%)', minWidth: 150 }, // 供入明细完整率列
    { field: 'processCode', title: '供出电量(kWh)', minWidth: 150 }, // 供出电量列
    { field: 'processName', title: '供出明细完整率(%)', minWidth: 150 }, // 供出明细完整率列
  ],
  height: 500, // 表格高度
  stripe: true, // 启用斑马纹
  sortConfig: {
    multiple: true, // 允许多列排序
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        /**
         * { page }
       * {
          page: page.currentPage,
          pageSize: page.pageSize,
        }
       */
        return await queryData();
      },
    },
  },
  toolbarConfig: {
    custom: true, // 自定义工具栏
    refresh: true, // 刷新按钮
    zoom: true, // 缩放按钮
  },
};

// 表格事件监听
const gridEvents: VxeGridListeners<any> = {};

// 使用表格组件
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 获取物料类型的中文描述
 * @param state 物料类型编码
 * @returns 物料类型的中文描述
 */
function getMaterialTypeText(state: number): string {
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
  searchTime: [] as any, // 查询时间范围
  processCode: '', // 工序编号
  workstationCode: '', // 工作站编号
  workstationName: '', // 工作站名称
  worksheetCode: '', // 工单号
  productCode: '', // 产品料号
  productName: '', // 产品名称
});

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 * { page, pageSize }: any
 */
function queryData(): Promise<any> {
  return new Promise((resolve) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      // 格式化时间范围
      params.startTime = params.searchTime[0].format('YYYY-MM-DD');
      params.endTime = params.searchTime[1].format('YYYY-MM-DD');
      params.searchTime = undefined;
    }
    // 返回模拟数据
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
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
