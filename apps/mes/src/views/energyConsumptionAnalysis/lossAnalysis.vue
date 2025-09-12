<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  RadioGroup,
  RangePicker,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { dayEnergyLossList } from '#/api';
import { $t } from '#/locales';

// region 表格操作

// 表格配置项
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中
  border: true, // 显示边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动生成序号列
    { field: 'lossNumber', title: '线损对象编码', minWidth: 200 }, // 线损对象编码
    { field: 'lossName', title: '线损对象名称', minWidth: 200 }, // 线损对象名称列
    { field: 'allValue', title: '总能耗', minWidth: 200 }, // 总能耗
    { field: 'useValue', title: '使用能耗', minWidth: 150 }, // 使用能耗
    { field: 'lossRate', title: '线损率(%)', minWidth: 150 }, // 线损率列
    { field: 'time', title: '时间', minWidth: 150 }, // 线损率列
  ],
  height: 500, // 表格高度
  stripe: true, // 启用斑马纹
  sortConfig: {
    multiple: true, // 允许多列排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        /**
         * { page }
       * {
          page: page.currentPage,
          pageSize: page.pageSize,
        }
       */
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
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
const queryParams = ref<any>({
  searchTime: [] as any, // 查询时间范围
  name: '',
  timeType: 'day',
});
const timeTypeOptions = [
  {
    label: '年',
    value: 'year',
  },
  {
    label: '月',
    value: 'month',
  },
  {
    label: '日',
    value: 'day',
  },
];

const timeFormat: any = {
  day: 'YYYY-MM-DD',
  month: 'YYYY-MM',
  year: 'YYYY',
};

/**
 * 查询数据
 * 这个函数用于向服务器发送请求，获取用户列表数据，并更新前端的数据显示和分页信息。
 *
 */
function queryData({ page, pageSize }: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };
    if (params.searchTime && params.searchTime.length === 2) {
      // 格式化时间范围
      params.startTime = params.searchTime[0].format(
        timeFormat[params.timeType],
      );
      params.endTime = params.searchTime[1].format(timeFormat[params.timeType]);
      params.searchTime = undefined;
    }
    dayEnergyLossList({
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
          <Input v-model:value="queryParams.name" />
        </FormItem>
        <!-- 统计周期 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.statisticalPeriod')"
          style="margin-bottom: 1em"
        >
          <RadioGroup
            v-model:value="queryParams.timeType"
            :options="timeTypeOptions"
          />
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="queryParams.timeType"
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
        <template #materialType="{ row }">
          <span> {{ getMaterialTypeText(row.materialType) }} </span>
        </template>
      </Grid>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
