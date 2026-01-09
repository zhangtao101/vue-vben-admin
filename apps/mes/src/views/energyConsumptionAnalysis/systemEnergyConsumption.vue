<script lang="ts" setup>
/**
 * 系统能耗分析页面
 * 功能：全面分析系统能耗情况，包含分项对比、占比分析、同比分析和趋势分析
 *
 * 主要功能模块：
 * 1. 分项用能对比（去年vs今年）
 * 2. 分项用能占比分析（环形图）
 * 3. 分项用能同比分析（支持分项选择）
 * 4. 分项用能趋势分析（折线图+面积图）
 * 5. 对比项目管理
 */

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import { Card, Col, Row, Select } from 'ant-design-vue';

import {
  getFXEnergy,
  getFXEnergyDB,
  getFXEnergyQS,
  getFXEnergyTB,
  getItemized,
  getItemizedList,
} from '#/api';

// region 分项用能对比分析
const ids = ref([]);

/**
 * 分项用能对比分析图表实例
 * 展示各分项系统去年和今年的用能对比
 */
let itemizedEnergyAnalysisChart: any;

/**
 * 创建分项用能对比分析图表
 * 使用横向分组柱状图展示各分项系统的去年vs今年用能对比
 *
 * @param chartData 图表数据数组
 */
function itemizedEnergyAnalysisChartCreation(chartData: any) {
  if (itemizedEnergyAnalysisChart) {
    // 更新现有图表数据
    itemizedEnergyAnalysisChart.changeData(chartData);
  } else {
    // 创建新图表
    itemizedEnergyAnalysisChart = new Chart({ container: 'energyContrast' });
    itemizedEnergyAnalysisChart.options({
      type: 'interval',
      height: 400,
      autoFit: true,
      data: chartData,
      encode: {
        x: 'type', // X轴：分项系统名称
        y: 'data', // Y轴：能耗数值
        color: 'name', // 颜色：去年/今年
      },
      transform: [{ type: 'dodgeX' }], // X轴分组变换
      interaction: {
        elementHighlightByX: { background: true }, // X轴元素高亮
        tooltip: { shared: true }, // 共享工具提示
      },
      coordinate: { transform: [{ type: 'transpose' }] }, // 转置坐标系（横向柱状图）
      axis: {
        x: { title: false }, // 隐藏X轴标题
        y: { title: false }, // 隐藏Y轴标题
      },
    });
  }
  itemizedEnergyAnalysisChart.render();
}

/**
 * 查询分项用能对比数据
 * 获取各分项系统的去年和今年能耗数据，用于对比分析
 */
function queryItemizedEnergyAnalysisChart() {
  getFXEnergyDB({
    ids: ids.value.join(','),
  }).then((data) => {
    const chartData: any = [];

    // 将数据转换为图表需要的格式
    data.forEach((item: any) => {
      chartData.push(
        {
          type: item.systemName, // 分项系统名称
          data: item.lastValue, // 去年能耗值
          name: '去年',
        },
        {
          type: item.systemName, // 分项系统名称
          data: item.currentValue, // 今年能耗值
          name: '今年',
        },
      );
    });

    // 创建图表
    itemizedEnergyAnalysisChartCreation(chartData);
  });
}
// endregion

// region 分项用能占比分析

/**
 * 能耗占比分析图表实例
 * 使用环形图展示各分项系统的能耗占比
 */
let analysisEnergyRatioChart: any;

/**
 * 创建能耗占比分析图表
 * 使用极坐标环形图展示各分项系统的能耗占比情况
 *
 * @param chartData 图表数据数组
 */
function createAnAnalyticalEnergyShareChart(chartData: any) {
  if (analysisEnergyRatioChart) {
    // 更新现有图表数据
    analysisEnergyRatioChart.changeData(chartData);
  } else {
    // 创建新图表
    analysisEnergyRatioChart = new Chart({ container: 'energyUseRatio' });

    analysisEnergyRatioChart.options({
      type: 'interval',
      autoFit: true,
      height: 400,
      data: chartData,
      encode: {
        x: 'systemName', // X轴：分项系统名称
        y: 'energyValue', // Y轴：能耗数值
        color: 'systemName', // 颜色：按分项系统着色
      },
      scale: { x: { padding: 0 } }, // X轴无填充
      coordinate: {
        type: 'polar', // 极坐标系
        innerRadius: 0.2, // 内半径，形成环形图
      },
      style: {
        lineWidth: 1, // 边框宽度
        stroke: '#fff', // 边框颜色
      },
      state: {
        active: { stroke: 'black', lineWidth: 1, zIndex: 101 }, // 激活状态
        inactive: { opacity: 0.5, zIndex: 100 }, // 非激活状态
      },
      axis: false, // 隐藏坐标轴
      legend: false, // 隐藏图例
      // legend: {
      //   color: { position: 'right', layout: { justifyContent: 'center' } }, // 图例位置
      // },
      tooltip: {
        title: (d: any) => d.year, // 工具提示标题
        items: [
          (d: any, _i: any, _data: any, _column: any) => ({
            name: d.systemName,
            value: d.energyValue,
            channel: 'y',
          }),
        ],
      },
      interaction: { elementHighlight: true }, // 元素高亮交互
      labels: [
        {
          text: 'systemName',
          position: 'outside',
          fontWeight: 'bold', // 标签样式
        },
      ],
    });
  }

  analysisEnergyRatioChart.render();
}

/**
 * 查询能耗占比数据
 * 获取各分项系统的能耗占比数据，用于环形图展示
 */
function queryEnergyConsumptionRatio() {
  getFXEnergy({
    ids: ids.value.join(','),
  }).then((data) => {
    createAnAnalyticalEnergyShareChart(data);
  });
}

// endregion

// region 分项用能同比分析

/**
 * 同比分析图表实例
 * 展示特定分项系统的去年vs今年能耗对比
 */
let yearOnYearAnalysisChart: any;

/**
 * 创建同比分析图表
 * 使用分组柱状图展示特定分项系统的同比数据
 *
 * @param chartData 图表数据数组
 */
function createYearOverYearAnalysisCharts(chartData: any) {
  if (yearOnYearAnalysisChart) {
    // 更新现有图表数据
    yearOnYearAnalysisChart.changeData(chartData);
  } else {
    // 创建新图表
    yearOnYearAnalysisChart = new Chart({
      container: 'yearOnYearAnalysis',
      height: 400,
      autoFit: true,
    });
    yearOnYearAnalysisChart.options({
      type: 'interval',
      data: chartData,
      encode: {
        x: 'type', // X轴：分项系统名称
        y: 'data', // Y轴：能耗数值
        color: 'name', // 颜色：去年/今年
      },
      transform: [{ type: 'dodgeX' }], // X轴分组变换
      interaction: {
        elementHighlightByX: { background: true }, // X轴元素高亮
        tooltip: { shared: true }, // 共享工具提示
      },
      axis: {
        x: { title: false }, // 隐藏X轴标题
        y: { title: false }, // 隐藏Y轴标题
      },
    });
    yearOnYearAnalysisChart.render();
  }
}

/**
 * 查询同比分析数据
 * 根据选择的分项名称获取去年和今年的能耗对比数据
 */
function queryYearOverYearAnalysisChartsData() {
  getFXEnergyTB({
    systemName: contrast.value, // 传入选中的分项名称
  }).then((data) => {
    const chartData: any = [];

    // 将数据转换为图表需要的格式
    data.forEach((item: any) => {
      chartData.push(
        {
          type: item.systemName, // 分项系统名称
          data: item.lastValue, // 去年能耗值
          name: '去年',
        },
        {
          type: item.systemName, // 分项系统名称
          data: item.currentValue, // 今年能耗值
          name: '今年',
        },
      );
    });

    // 创建图表
    createYearOverYearAnalysisCharts(chartData);
  });
}

// endregion

// region 分项用能趋势分析

/**
 * 能耗趋势分析图表实例
 * 使用折线图+面积图展示能耗变化趋势
 */
let trendChartOfItemizedEnergyUse: any;

/**
 * 创建能耗趋势分析图表
 * 使用组合图表（面积图+折线图）展示能耗时间趋势
 *
 * @param chartData 图表数据数组
 */
function createATrendChartForItemizedEnergyUse(chartData: any) {
  if (trendChartOfItemizedEnergyUse) {
    // 更新现有图表数据
    trendChartOfItemizedEnergyUse.changeData(chartData);
  } else {
    // 创建新图表
    trendChartOfItemizedEnergyUse = new Chart({ container: 'energyUseTrend' });

    trendChartOfItemizedEnergyUse.options({
      type: 'view', // 视图类型，支持多图层
      autoFit: true,
      height: 400,
      data: chartData,
      encode: {
        x: 'time', // X轴：时间
        y: 'value', // Y轴：能耗值
        color: 'systemName', // 颜色：按分项系统着色
      },
      axis: {
        x: { title: false }, // 隐藏X轴标题
        y: { title: false }, // 隐藏Y轴标题
      },
      children: [
        {
          type: 'area', // 面积图图层
          style: { fillOpacity: 0.3 }, // 填充透明度
        },
        {
          type: 'line', // 折线图图层
          style: { strokeWidth: 2 }, // 线条宽度
          tooltip: false, // 禁用折线图的工具提示（避免重复）
        },
      ],
    });
  }

  trendChartOfItemizedEnergyUse.render();
}

/**
 * 查询分项用能趋势数据
 * 根据选择的分项名称获取近30天的能耗趋势数据
 */
function queryATrendChartForItemizedEnergyUseData() {
  getFXEnergyQS({
    systemName: contrast.value, // 传入选中的分项名称
  }).then((data) => {
    createATrendChartForItemizedEnergyUse(data);
  });
}

// endregion

// region 分项系统查询(ID)
/**
 * 分项系统列表
 */
const systemOptions = ref<any>([]);

/**
 * 查询分项系统, 带id
 */
function itemSystemQueryID() {
  getItemized().then((res: any) => {
    systemOptions.value = [];
    res.forEach((item: any) => {
      systemOptions.value.push({
        value: item.id,
        label: item.systemName,
      });
    });
  });
}

// endregion

// region 对比项目管理

/**
 * 对比分项列表选项
 * 用于同比分析和趋势分析中的分项选择
 */
const contrastItem = ref<any>([]);

/**
 * 当前选中的对比分项
 */
const contrast = ref('');

/**
 * 查询可用的分项名称列表
 * 获取所有分项系统名称，用于下拉选择
 */
function queryContrastType() {
  getItemizedList().then((data) => {
    contrastItem.value = [];

    // 将返回的字符串数组转换为选项格式
    data.forEach((item: string) => {
      contrastItem.value.push({
        label: item,
        value: item,
      });
    });

    // 默认选中第一个分项
    contrast.value = data[0];

    // 自动查询该分项的数据
    query();
  });
}

/**
 * 查询选中分项的同比和趋势数据
 * 当切换分项选择时调用此函数更新相关图表
 */
function query() {
  queryYearOverYearAnalysisChartsData();
  queryATrendChartForItemizedEnergyUseData();
}

// endregion

/**
 * 页面挂载时初始化
 * 一次性加载所有图表的数据
 */
onMounted(() => {
  // 查询能耗占比数据
  queryEnergyConsumptionRatio();

  // 查询分项用能对比数据
  queryItemizedEnergyAnalysisChart();

  // 查询分项列表并初始化同比和趋势分析
  queryContrastType();

  // 查询分项系统(带id)
  itemSystemQueryID();
});
</script>

<template>
  <Page>
    <Card class="my-2">
      <label>
        分项名称:
        <Select
          class="w-[80%]"
          mode="multiple"
          v-model:value="ids"
          :options="systemOptions"
          @change="
            () => {
              queryEnergyConsumptionRatio();
              queryItemizedEnergyAnalysisChart();
            }
          "
        />
      </label>
    </Card>
    <Row :gutter="20" class="mb-4 mt-4">
      <Col :span="12">
        <Card title="分项用能对比">
          <div id="energyContrast" class="min-h-[300px]"></div>
        </Card>
      </Col>
      <Col :span="12">
        <Card title="分项用能占比（近30天）">
          <div id="energyUseRatio" class="min-h-[300px]"></div>
        </Card>
      </Col>
    </Row>

    <Card class="my-2">
      <label>
        分项名称:
        <Select
          class="w-48"
          v-model:value="contrast"
          :options="contrastItem"
          @change="query()"
        />
      </label>
    </Card>
    <Row :gutter="20">
      <Col :span="12">
        <Card title="分项用能同比分析">
          <div id="yearOnYearAnalysis" class="min-h-[300px]"></div>
        </Card>
      </Col>
      <Col :span="12">
        <Card title="分项用能趋势（近30天）">
          <div id="energyUseTrend" class="min-h-[300px]"></div>
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped></style>
