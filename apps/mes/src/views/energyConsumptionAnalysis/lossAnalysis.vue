<script lang="ts" setup>
/**
 * 线损分析页面
 * 功能：分析能源在传输过程中的损耗情况，支持按不同时间粒度统计线损数据
 *
 * 主要功能模块：
 * 1. 线损数据查询（按对象名称、时间范围、统计周期）
 * 2. 线损数据表格展示
 * 3. 物料类型中文转换
 * 4. 分页和排序功能
 */

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

// region 表格相关功能

/**
 * 线损数据表格配置选项
 * 用于展示线损分析数据的详细信息
 */
const gridOptions: VxeGridProps<any> = {
  align: 'center', // 表格内容居中对齐
  border: true, // 显示表格边框
  columns: [
    { title: '序号', type: 'seq', width: 50 }, // 自动生成的序号列
    { field: 'lossNumber', title: '线损对象编码', minWidth: 200 }, // 线损对象的唯一编码
    { field: 'lossName', title: '线损对象名称', minWidth: 200 }, // 线损对象的名称
    { field: 'allValue', title: '总能耗', minWidth: 200 }, // 总能耗数值
    { field: 'useValue', title: '使用能耗', minWidth: 150 }, // 实际使用的能耗
    { field: 'lossRate', title: '线损率(%)', minWidth: 150 }, // 线损率百分比
    { field: 'time', title: '时间', minWidth: 150 }, // 统计时间点
  ],
  height: 500, // 固定表格高度
  stripe: true, // 启用斑马纹样式
  sortConfig: {
    multiple: true, // 支持多列排序
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        // 异步查询数据
        return await queryData({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true, // 显示自定义列按钮
    refresh: true, // 显示刷新按钮
    zoom: true, // 显示缩放按钮
  },
};

/**
 * 表格事件监听器
 * 目前暂无特殊事件处理
 */
const gridEvents: VxeGridListeners<any> = {};

/**
 * 创建表格实例和API
 */
const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 获取物料类型的中文描述
 * 将物料类型编码转换为对应的中文显示文本
 *
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

// region 数据查询相关功能

/**
 * 查询参数
 * 包含时间范围、对象名称和统计周期
 */
const queryParams = ref<any>({
  searchTime: [] as any, // 查询时间范围
  name: '', // 线损对象名称筛选
  timeType: 'day', // 统计周期，默认按天
});

/**
 * 统计周期选项
 * 支持按年、月、日进行统计分析
 */
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

/**
 * 时间格式化映射
 * 根据统计周期设置对应的日期格式
 */
const timeFormat: any = {
  day: 'YYYY-MM-DD', // 日格式
  month: 'YYYY-MM', // 月格式
  year: 'YYYY', // 年格式
};

/**
 * 查询线损数据
 * 根据查询条件获取分页数据，用于表格展示
 *
 * @param page 当前页码
 * @param pageSize 每页显示数量
 * @returns Promise 返回分页数据
 */
function queryData({ page, pageSize }: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const params: any = { ...queryParams.value };

    // 处理时间范围参数
    if (params.searchTime && params.searchTime.length === 2) {
      // 根据统计周期格式化时间
      params.startTime = params.searchTime[0].format(
        timeFormat[params.timeType],
      );
      params.endTime = params.searchTime[1].format(timeFormat[params.timeType]);
      // 移除原始时间范围参数
      params.searchTime = undefined;
    }

    // 调用接口获取线损数据
    dayEnergyLossList({
      ...params, // 展开所有查询参数
      pageNum: page, // 当前页码
      pageSize, // 每页显示的数据条数
    })
      .then(({ total, list }) => {
        // 返回符合表格组件要求的数据格式
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

// region 权限控制
/**
 * 当前页面按钮权限列表
 * 暂时注释掉，如需要启用可取消注释
 */
// const author = ref<string[]>([]);

// endregion

// region 页面初始化

/**
 * 页面挂载时执行的初始化操作
 * 目前暂无特殊的初始化逻辑，权限查询已注释
 */
onMounted(() => {
  // 查询页面权限（当前注释状态）
  /* queryAuth(route.meta.code as string).then((data) => {
    author.value = data;
  });*/
});

// endregion
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
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

    <!-- region 数据表格区域 -->
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
