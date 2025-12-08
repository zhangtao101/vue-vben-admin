<script lang="ts" setup>
/**
 * 班组能耗分析页面
 * 功能：分析不同班组的能耗情况，支持按时间粒度查询和图表/表格展示
 *
 * 主要功能模块：
 * 1. 班组能耗查询（按班组、时间范围、时间粒度）
 * 2. 能耗数据图表展示（多系列折线图）
 * 3. 能耗数据表格展示
 * 4. 显示方式切换（图表/表格）
 * 5. 多时间粒度支持（日/月/年）
 */

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { MdiSearch } from '@vben/icons';
import { $t } from '@vben/locales';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import {
  Button,
  Card,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  RangePicker,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getClassNameList,
  getDayClassEnergy,
  getMonthClassEnergy,
  getYearClassEnergy,
} from '#/api';
import BasicTblae from '#/util/component/basicTblae.vue';

// region 显示方式相关功能

/**
 * 显示类型选项
 * 支持图表和表格两种数据展示方式
 */
const showType = ref([
  // 图表展示
  {
    label: $t('energyConsumption.energyConsumptionStatistics.chart'),
    value: 'chart',
  },
  // 表格展示
  {
    label: $t('energyConsumption.energyConsumptionStatistics.table'),
    value: 'table',
  },
]);

/**
 * 当前选中的显示类型
 * 默认显示图表
 */
const selectShowType = ref('chart');

// endregion

// region 数据查询相关功能

/**
 * 查询参数
 * 包含时间粒度、班组名称和时间范围
 */
const queryParams = ref<any>({
  timeType: 1, // 默认按日统计
});

/**
 * 时间选择器类型映射
 * 根据时间粒度设置选择器的picker类型
 */
const timeType: any = {
  1: 'date', // 日
  2: 'month', // 月
  3: 'year', // 年
};

/**
 * 班组名称列表
 * 用于选择要分析的班组
 */
const dataTypeList = ref<any>([]);

/**
 * 查询班组名称列表
 * 获取所有可用的班组名称，用于下拉选择
 */
function queryDataTypeList() {
  getClassNameList().then((data) => {
    dataTypeList.value = [];

    // 将返回的字符串数组转换为选项格式
    data.forEach((item: string) => {
      dataTypeList.value.push({
        label: item,
        value: item,
      });
    });
  });
}

// endregion

// region 图表相关功能

/**
 * 班组能耗分析图表实例
 * 使用多系列折线图展示用电量趋势
 */
let chart: any;

/**
 * 初始化班组能耗分析图表
 * 使用多系列平滑折线图展示不同时间粒度的能耗趋势
 *
 * @param chartData 图表数据数组
 */
function chartInit(chartData: any = []) {
  if (chart) {
    // 更新现有图表数据
    chart.options({
      data: chartData,
    });
  } else {
    // 创建新图表
    chart = new Chart({ container: 'container' });
    chart.options({
      type: 'view', // 视图类型，支持多图层
      autoFit: true,
      data: chartData,
      children: [
        {
          type: 'line', // 折线图
          encode: {
            x: 'time', // X轴：时间
            y: '用电量', // Y轴：用电量
            shape: 'smooth', // 平滑曲线
          },
          scale: {
            y: { independent: true }, // Y轴独立刻度
          },
          axis: {
            y: {
              title: '用电量', // Y轴标题
              grid: null, // 隐藏网格线
            },
          },
        },
      ],
    });
  }

  chart.render();
}

/**
 * 时间格式化映射
 * 根据统计周期设置对应的日期格式
 */
const formMat: any = {
  1: 'YYYY-MM-DD', // 日格式
  2: 'YYYY-MM', // 月格式
  3: 'YYYY', // 年格式
};

/**
 * 查询图表数据
 * 根据时间粒度调用不同接口，并格式化图表数据
 */
function queryChartData() {
  const params: any = {
    className: queryParams.value.className, // 班组名称
  };

  // 处理时间范围参数
  if (queryParams.value.searchTime) {
    params.startTime = queryParams.value.searchTime[0].format(
      formMat[queryParams.value.timeType],
    );
    params.endTime = queryParams.value.searchTime[1].format(
      formMat[queryParams.value.timeType],
    );
  }

  let ob: any;

  // 根据时间粒度选择对应的接口
  switch (queryParams.value.timeType) {
    case 1: {
      // 日统计
      ob = getDayClassEnergy(params);
      break;
    }
    case 2: {
      // 月统计
      ob = getMonthClassEnergy(params);
      break;
    }
    case 3: {
      // 年统计
      ob = getYearClassEnergy(params);
      break;
    }
  }

  ob.then(({ list }: any) => {
    const chartData: any[] = [];

    if (queryParams.value.timeType === 1) {
      // 日数据：只显示用电量
      list.forEach((item: any) => {
        chartData.push({
          time: item.time,
          用电量: item.dlValue,
          用水量: 0, // 日数据无用水量，设为0
        });
      });
    } else {
      // 月/年数据：显示用电量和用水量
      list.forEach((item: any) => {
        chartData.push({
          time: item.time,
          用电量: item.dlValue,
          用水量: item.slValue,
        });
      });
    }

    chartInit(chartData);
  });
}

// endregion

// region 表格相关功能

/**
 * 日统计数据表格列配置
 * 展示班组单日用电量数据
 */
const columnsDay: any = [
  {
    field: 'classNumber',
    title: '班组编号',
    minWidth: 150,
  },
  {
    field: 'className',
    title: '班组名称',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '用能单元分区',
    minWidth: 150,
  },
  {
    field: 'dlValue',
    title: '用电量',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];

/**
 * 月/年统计数据表格列配置
 * 展示班组用电量和用水量数据
 */
const columnsOuther: any = [
  {
    field: 'classNumber',
    title: '班组编号',
    minWidth: 150,
  },
  {
    field: 'className',
    title: '班组名称',
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: '用能单元分区',
    minWidth: 150,
  },
  {
    field: 'dValue',
    title: '用电量',
    minWidth: 150,
  },
  {
    field: 'slValue',
    title: '用水能',
    minWidth: 150,
  },
  {
    field: 'time',
    title: '时间',
    minWidth: 150,
  },
];

/**
 * 表格API实例
 * 用于表格数据重新加载等操作
 */
let gridApi: any;
/**
 * 查询表格数据
 * 根据班组名称和时间粒度查询班组能耗数据，用于表格展示
 *
 * @param _params 表格分页参数（当前未使用，传入的是完整数据）
 * @returns Promise 返回分页数据格式
 */
function queryData(_params: any) {
  return new Promise((resolve, _reject) => {
    const params: any = {
      className: queryParams.value.className, // 班组名称
    };

    // 处理时间范围参数
    if (queryParams.value.searchTime) {
      params.startTime = queryParams.value.searchTime[0].format(
        formMat[queryParams.value.timeType],
      );
      params.endTime = queryParams.value.searchTime[1].format(
        formMat[queryParams.value.timeType],
      );
    }

    let ob: any;

    // 根据时间粒度选择对应的接口
    switch (queryParams.value.timeType) {
      case 1: {
        ob = getDayClassEnergy(params);
        break;
      }
      case 2: {
        ob = getMonthClassEnergy(params);
        break;
      }
      case 3: {
        ob = getYearClassEnergy(params);
        break;
      }
    }

    ob.then(({ list }: any) => {
      // 返回符合BasicTblae组件要求的数据格式
      resolve({
        total: list.length,
        items: list,
      });
    });
  });
}

// endregion

// region 页面生命周期

/**
 * 页面挂载时初始化
 * 设置默认查询时间并加载数据
 */
onMounted(() => {
  // 设置默认查询时间范围：上个月至今
  const now = dayjs();
  queryParams.value.searchTime = [now.subtract(1, 'month'), now];

  // 查询班组名称列表
  queryDataTypeList();

  // 查询图表数据
  queryChartData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <Card class="mb-4 mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 班组名称 -->
        <FormItem
          :label="$t('energyConsumption.energyConsumptionAnalysis.teamName')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.className"
            :options="dataTypeList"
            class="!w-36"
          />
        </FormItem>
        <!-- 时间粒度 -->
        <FormItem
          :label="$t('electricityConsumptionData.timeGranularity')"
          style="margin-bottom: 1em"
        >
          <RadioGroup v-model:value="queryParams.timeType" button-style="solid">
            <!-- 日 -->
            <RadioButton :value="1">
              {{ $t('electricityConsumptionData.day') }}
            </RadioButton>

            <!-- 月 -->
            <RadioButton :value="2">
              {{ $t('electricityConsumptionData.month') }}
            </RadioButton>

            <!-- 年 -->
            <RadioButton :value="3">
              {{ $t('electricityConsumptionData.years') }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <!-- 时间范围 -->
        <FormItem
          :label="$t('useEnergyThroughoutTheEntireSection.timeFrame')"
          style="margin-bottom: 1em"
        >
          <RangePicker
            v-model:value="queryParams.searchTime"
            :picker="timeType[queryParams.timeType]"
          />
        </FormItem>

        <FormItem style="margin-bottom: 1em">
          <Button
            :icon="h(MdiSearch, { class: 'inline-block mr-2' })"
            type="primary"
            @click="
              () => {
                queryChartData();
                if (gridApi) {
                  gridApi.reload();
                }
              }
            "
          >
            {{ $t('common.search') }}
          </Button>
        </FormItem>
      </Form>
    </Card>
    <!-- endregion -->

    <!-- region 显示方式切换 -->
    <RadioGroup
      v-model:value="selectShowType"
      option-type="button"
      :options="showType"
    />
    <!-- endregion -->
    <!-- region 数据展示区域 -->
    <Card class="mb-4 mt-4">
      <div id="container" v-show="'chart' === selectShowType"></div>
      <template v-if="'table' === selectShowType">
        <!-- region 表格-日 -->
        <BasicTblae
          :columns="columnsDay"
          :query-data="queryData"
          :is-pages="false"
          v-if="queryParams.timeType === 1"
          @initialization-complete="(grid) => (gridApi = grid)"
        />
        <!-- endregion -->
        <!-- region 表格-月/年 -->
        <BasicTblae
          :columns="columnsOuther"
          :query-data="queryData"
          :is-pages="false"
          v-if="queryParams.timeType !== 1"
          @initialization-complete="(grid) => (gridApi = grid)"
        />
        <!-- endregion -->
      </template>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
