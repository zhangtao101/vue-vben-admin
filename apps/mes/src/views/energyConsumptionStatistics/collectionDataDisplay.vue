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
import { obtainRawAcquisitionData } from '#/api';
import { $t } from '#/locales';
import { queryAuth } from '#/util';

// region 表格操作

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'equipCode', title: '设备编号', minWidth: 190 },
    { field: 'regtime', title: '采集时间', minWidth: 190 },
    { field: 'axxdy', title: 'a相相电压', minWidth: 190 },
    { field: 'bxxdy', title: 'b相相电压', minWidth: 190 },
    { field: 'cxxdy', title: 'c相相电压', minWidth: 190 },
    { field: 'axqdy', title: 'a相线电压', minWidth: 190 },
    { field: 'bxqdy', title: 'b相线电压', minWidth: 190 },
    { field: 'cxqdy', title: 'c相线电压', minWidth: 190 },
    { field: 'axdl', title: 'a相电流', minWidth: 190 },
    { field: 'bxdl', title: 'b相电流', minWidth: 190 },
    { field: 'cxdl', title: 'c相电流', minWidth: 190 },
    { field: 'axyggl', title: 'a相有功功率', minWidth: 190 },
    { field: 'bxyggl', title: 'b相有功功率', minWidth: 190 },
    { field: 'cxyggl', title: 'c相有功功率', minWidth: 190 },
    { field: 'zyggl', title: '总有功功率', minWidth: 190 },
    { field: 'axwggl', title: 'a相无功功率', minWidth: 190 },
    { field: 'bxwggl', title: 'b相无功功率', minWidth: 190 },
    { field: 'cxwggl', title: 'c相无功功率', minWidth: 190 },
    { field: 'zwggl', title: '总无功功率', minWidth: 190 },
    { field: 'zszgl', title: '总视在功率', minWidth: 190 },
    { field: 'glys', title: '功率因数', minWidth: 190 },
    { field: 'dwpl', title: '电网频率', minWidth: 190 },
    { field: 'zxygdn', title: '正向有功电能', minWidth: 190 },
    { field: 'fxygdn', title: '反向有功电能', minWidth: 190 },
    { field: 'zxwgdn', title: '正向无功电能', minWidth: 190 },
    { field: 'fxwgdn', title: '反向无功电能', minWidth: 190 },
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

// 查询参数
const queryParams = ref<any>({});
/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 */
function queryData({ page, pageSize }: any) {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };

    if (params.time) {
      params.startTime = params.time[0].format('YYYY-MM-DD HH:mm:ss');
      params.endTime = params.time[1].format('YYYY-MM-DD HH:mm:ss');
      delete  params.time;
    }
    obtainRawAcquisitionData({
      ...params, // 展开 queryParams.value 对象，包含所有查询参数。
      pageNum: page, // 当前页码。
      pageSize, // 每页显示的数据条数。
    })
      .then(({ total, list }) => {
        // 处理 queryWorkstation 函数返回的 Promise，获取总条数和数据列表。
        resolve({
          total,
          items: list || [{}],
        });
      })
      .catch((error) => {
        resolve({
          total: 0,
          items: [{}],
        });
        reject(error);
      });
  });
}

// endregion

// region 权限查询

// 路由信息
const route = useRoute();
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
        <!-- 设备编号 -->
        <FormItem
          :label="
            $t('energyConsumption.energyConsumptionAnalysis.deviceNumber')
          "
          style="margin-bottom: 1em"
        >
          <Input v-model:value="queryParams.equipCode" />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionAnalysis.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker v-model:value="queryParams.time" show-time />
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
      <Grid />
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
