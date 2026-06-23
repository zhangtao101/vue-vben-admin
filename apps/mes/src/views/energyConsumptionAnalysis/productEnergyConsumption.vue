<script lang="ts" setup>
/**
 * 产品能耗分析页面
 * 功能：分析不同分项系统的能耗情况，支持图表和表格两种展示方式
 *
 * 主要功能模块：
 * 1. 能耗分项查询（按时间粒度、分项名称）
 * 2. 能耗数据图表展示（堆叠柱状图）
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
  DatePicker,
  Form,
  FormItem,
  RadioButton,
  RadioGroup,
  Select,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  getDayItemizedEnergy,
  getItemizedList,
  getMonthItemizedEnergy,
  getYearItemizedEnergy,
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
 * 包含时间粒度和选择的分项名称
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
 * 分项名称列表
 * 用于选择要分析的分项系统
 */
const dataTypeList = ref<any>([]);

/**
 * 查询分项名称列表
 * 获取所有可用的分项系统名称，用于下拉选择
 */
function queryDataTypeList() {
  getItemizedList().then((data) => {
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
 * G2图表实例
 */
let chart: any;

/**
 * 初始化或更新能耗分析图表
 * 使用堆叠柱状图展示不同分项系统的能耗数据
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
      type: 'interval', // 柱状图类型
      autoFit: true, // 自适应容器大小
      data: chartData,
      encode: {
        x: $t('energyConsumption.energyConsumptionAnalysis.time'), // X轴：时间
        y: $t('energyConsumption.energyConsumptionAnalysis.energyKwh'), // Y轴：能耗值
        color: 'name', // 颜色：分项系统名称
      },
      transform: [{ type: 'stackY' }], // Y轴堆叠转换
      interaction: { elementHighlight: { background: true } }, // 元素高亮交互
    });
  }

  chart.render();
}

/**
 * 查询图表数据
 * 根据时间粒度调用不同的接口，并格式化图表数据
 */
function queryChartData() {
  const params: any = {
    itemizedName: queryParams.value.itemizedName, // 分项名称
  };

  let ob: any;

  // 根据时间粒度选择对应的接口和参数格式
  switch (queryParams.value.timeType) {
    case 1: {
      // 日统计：需要具体的日期
      params.day = queryParams.value.searchTime.format('YYYY-MM-DD');
      ob = getDayItemizedEnergy(params);
      break;
    }
    case 2: {
      // 月统计：需要年月
      params.month = queryParams.value.searchTime.format('YYYY-MM');
      ob = getMonthItemizedEnergy(params);
      break;
    }
    case 3: {
      // 年统计：只需要年份
      params.year = queryParams.value.searchTime.format('YYYY');
      ob = getYearItemizedEnergy(params);
      break;
    }
  }

  ob.then((data: any) => {
    const chartData: any[] = [];
    if (queryParams.value.timeType === 1) {
      // 日数据：按分项系统分组显示
      data.forEach((item: any) => {
        chartData.push({
          [$t('energyConsumption.energyConsumptionAnalysis.time')]: item.time,
          [$t('energyConsumption.energyConsumptionAnalysis.energyKwh')]: item.value,
          name: item.systemName,
        });
      });
    } else {
      // 月/年数据：按时段分组显示（尖峰平谷）
      data.forEach((item: any) => {
        chartData.push(
          {
            [$t('energyConsumption.energyConsumptionAnalysis.time')]: item.time,
            [$t('energyConsumption.energyConsumptionAnalysis.energyKwh')]: item.peakValue,
            name: $t('energyConsumption.energyConsumptionAnalysis.peakPeriodLabel'),
          },
          {
            [$t('energyConsumption.energyConsumptionAnalysis.time')]: item.time,
            [$t('energyConsumption.energyConsumptionAnalysis.energyKwh')]: item.spikeValue,
            name: $t('energyConsumption.energyConsumptionAnalysis.spikePeriodLabel'),
          },
          {
            [$t('energyConsumption.energyConsumptionAnalysis.time')]: item.time,
            [$t('energyConsumption.energyConsumptionAnalysis.energyKwh')]: item.flatValue,
            name: $t('energyConsumption.energyConsumptionAnalysis.flatPeriodLabel'),
          },
          {
            [$t('energyConsumption.energyConsumptionAnalysis.time')]: item.time,
            [$t('energyConsumption.energyConsumptionAnalysis.energyKwh')]: item.valleyValue,
            name: $t('energyConsumption.energyConsumptionAnalysis.valleyPeriodLabel'),
          },
        );
      });
    }

    chartInit(chartData);
  });
}

// endregion

// region 表格相关功能 - 日统计数据

/**
 * 日统计数据表格列配置
 * 按分项系统展示单日能耗数据
 */
const columnsDay: any = [
  {
    field: 'subarea',
    title: $t('energyConsumption.energyConsumptionAnalysis.unitPartition'),
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: $t('energyConsumption.energyConsumptionAnalysis.subitemSystemName'),
    minWidth: 150,
  },
  {
    field: 'value',
    title: $t('energyConsumption.energyConsumptionAnalysis.electricityConsumptionKwh'),
    minWidth: 150,
  },
  {
    field: 'time',
    title: $t('energyConsumption.energyConsumptionAnalysis.time'),
    minWidth: 150,
  },
];

/**
 * 查询表格数据
 * 根据时间粒度调用不同接口，返回表格组件需要的格式
 * @returns Promise 返回分页数据格式
 */
function queryData() {
  return new Promise((resolve, _reject) => {
    const params: any = {
      itemizedName: queryParams.value.itemizedName,
    };

    let ob: any;

    // 根据时间粒度选择对应的接口和参数
    switch (queryParams.value.timeType) {
      case 1: {
        params.day = queryParams.value.searchTime.format('YYYY-MM-DD');
        ob = getDayItemizedEnergy(params);
        break;
      }
      case 2: {
        params.month = queryParams.value.searchTime.format('YYYY-MM');
        ob = getMonthItemizedEnergy(params);
        break;
      }
      case 3: {
        params.year = queryParams.value.searchTime.format('YYYY');
        ob = getYearItemizedEnergy(params);
        break;
      }
    }

    ob.then((data: any) => {
      // 返回符合BasicTblae组件要求的数据格式
      resolve({
        total: data.length,
        items: data,
      });
    });
  });
}

// endregion

// region 表格相关功能 - 月/年统计数据

/**
 * 月/年统计数据表格列配置
 * 展示分时段（尖峰平谷）的能耗数据
 */
const columnsOther: any = [
  {
    field: 'subarea',
    title: $t('energyConsumption.energyConsumptionAnalysis.unitPartition'),
    minWidth: 150,
  },
  {
    field: 'systemName',
    title: $t('energyConsumption.energyConsumptionAnalysis.subitemSystemName'),
    minWidth: 150,
  },
  {
    field: 'peakValue',
    title: $t('energyConsumption.energyConsumptionAnalysis.peakPeriodElectricity'),
    minWidth: 150,
  },
  {
    field: 'spikeValue',
    title: $t('energyConsumption.energyConsumptionAnalysis.spikePeriodElectricity'),
    minWidth: 150,
  },
  {
    field: 'flatValue',
    title: $t('energyConsumption.energyConsumptionAnalysis.flatPeriodElectricity'),
    minWidth: 150,
  },
  {
    field: 'valleyValue',
    title: $t('energyConsumption.energyConsumptionAnalysis.valleyPeriodElectricity'),
    minWidth: 150,
  },
  {
    field: 'value',
    title: $t('energyConsumption.energyConsumptionAnalysis.totalElectricity'),
    minWidth: 150,
  },
  {
    field: 'time',
    title: $t('energyConsumption.energyConsumptionAnalysis.time'),
    minWidth: 150,
  },
];

// endregion

// region 页面生命周期

/**
 * 页面挂载时初始化
 * 设置默认查询时间并加载数据
 */
onMounted(() => {
  // 设置默认查询时间为当前日期
  queryParams.value.searchTime = dayjs();

  // 查询分项名称列表
  queryDataTypeList();

  // 查询图表数据
  queryChartData();
});
</script>

<template>
  <Page>
    <!-- region 查询条件区域 -->
    <Card class="!mb-4 !mt-4">
      <Form :model="queryParams" layout="inline">
        <!-- 数据类型 -->
        <FormItem
          :label="$t('electricityConsumptionData.sectionName')"
          style="margin-bottom: 1em"
        >
          <Select
            v-model:value="queryParams.itemizedName"
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
          <DatePicker
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
    <Card class="!mb-4 !mt-4">
      <div id="container" v-show="'chart' === selectShowType"></div>
      <template v-if="'table' === selectShowType">
        <!-- region 表格-日 -->
        <BasicTblae
          :columns="columnsDay"
          :query-data="queryData"
          :is-pages="false"
          v-if="queryParams.timeType === 1"
        />
        <!-- endregion -->
        <!-- region 表格-月/年 -->
        <BasicTblae
          :columns="columnsOther"
          :query-data="queryData"
          :is-pages="false"
          v-else
        />
        <!-- endregion -->
      </template>
    </Card>
    <!-- endregion -->
  </Page>
</template>

<style scoped></style>
