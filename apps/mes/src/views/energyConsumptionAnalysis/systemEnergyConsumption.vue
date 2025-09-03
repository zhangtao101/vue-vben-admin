<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Chart } from '@antv/g2';
import { Card, Col, RadioGroup, Row, Select } from 'ant-design-vue';

// region 类型选择
// 当前选中查看的类型
const type = ref('1');
// 类型列表
const typeOptions = [
  {
    label: '用能概览',
    value: '1',
  },
  {
    label: '统计分析',
    value: '2',
  },
];

// endregion

// region 分项用能分析

// 分项用能分析图表数据（示例数据）
// type: 能源类型，month: 月份标识，data: 用能数据值
const itemizedEnergyUseData = ref<any>([
  { type: '电能', month: '1.', data: 18.9 },
  { type: '电能', month: '2.', data: 28.8 },
  { type: '电能', month: '3.', data: 39.3 },
  { type: '电能', month: '4.', data: 81.4 },
  { type: '电能', month: '5', data: 47 },
  { type: '电能', month: '6.', data: 20.3 },
  { type: '电能', month: '7.', data: 24 },
  { type: '电能', month: '8.', data: 35.6 },
  { type: '煤气', month: '1.', data: 12.4 },
  { type: '煤气', month: '2.', data: 23.2 },
  { type: '煤气', month: '3.', data: 34.5 },
  { type: '煤气', month: '4.', data: 99.7 },
  { type: '煤气', month: '5', data: 52.6 },
  { type: '煤气', month: '6.', data: 35.5 },
  { type: '煤气', month: '7.', data: 37.4 },
  { type: '煤气', month: '8.', data: 42.4 },
]);
// 分项用能分析图表
let itemizedEnergyAnalysisChart: any;

/**
 * 创建分项用能分析图表
 * 1. 初始化图表容器
 * 2. 配置图表比例尺和坐标轴
 * 3. 设置图例位置
 * 4. 创建分组柱状图
 * 5. 使用转置坐标系（横向柱状图）
 * 6. 绑定数据并渲染
 */
function itemizedEnergyAnalysisChartCreation() {
  if (itemizedEnergyAnalysisChart) {
    // 绑定数据并渲染图表
    itemizedEnergyAnalysisChart.data(itemizedEnergyUseData.value);
  } else {
    itemizedEnergyAnalysisChart = new Chart({ container: 'energyContrast' });
    itemizedEnergyAnalysisChart.options({
      type: 'interval',
      height: 400,
      autoFit: true,
      data: itemizedEnergyUseData.value,
      encode: { x: 'month', y: 'data', color: 'type' },
      transform: [{ type: 'dodgeX' }],
      interaction: { elementHighlight: { background: true } },
      coordinate: { transform: [{ type: 'transpose' }] },
    });
  }
  itemizedEnergyAnalysisChart.render();
}
// endregion

// region 同比分析
// 对比项目
const contrastItem = ref([
  {
    label: '电能',
    value: '1',
  },
  {
    label: '天然气',
    value: '2',
  },
  {
    label: 'XXXXXXXXXXXXX',
    value: '3',
  },
]);

// 同比分析图表数据（示例数据）
const analyzeTheChartDataYearOnYear = ref<any>([
  { type: '今年', month: '1月', data: 18.9 },
  { type: '今年', month: '2月', data: 28.8 },
  { type: '今年', month: '3月', data: 39.3 },
  { type: '今年', month: '4月', data: 81.4 },
  { type: '今年', month: '5月', data: 47 },
  { type: '今年', month: '6月', data: 20.3 },
  { type: '今年', month: '7月', data: 24 },
  { type: '今年', month: '8月', data: 35.6 },
  { type: '去年', month: '1月', data: 12.4 },
  { type: '去年', month: '2月', data: 23.2 },
  { type: '去年', month: '3月', data: 34.5 },
  { type: '去年', month: '4月', data: 99.7 },
  { type: '去年', month: '5月', data: 52.6 },
  { type: '去年', month: '6月', data: 35.5 },
  { type: '去年', month: '7月', data: 37.4 },
  { type: '去年', month: '8月', data: 42.4 },
]);

// 同比分析图表实例
let yearOnYearAnalysisChart: any;

/**
 * 创建同比分析图表
 */
function createYearOverYearAnalysisCharts() {
  if (yearOnYearAnalysisChart) {
    // 绑定数据并渲染图表
    yearOnYearAnalysisChart.data(analyzeTheChartDataYearOnYear.value);
  } else {
    yearOnYearAnalysisChart = new Chart({ container: 'yearOnYearAnalysis' });
    yearOnYearAnalysisChart.options({
      type: 'interval',
      height: 400,
      autoFit: true,
      data: analyzeTheChartDataYearOnYear.value,
      encode: { x: 'month', y: 'data', color: 'type' },
      transform: [{ type: 'dodgeX' }],
      interaction: { elementHighlight: { background: true } },
    });
  }
  yearOnYearAnalysisChart.render();
}

// endregion

// region 分析用能占比
// 用于存储能耗占比图表实例
let analysisEnergyRatioChart: any;
// 能耗占比图表数据
const analyzeTheEnergyConsumptionChartData = ref<any>([
  { item: '事例一', count: 40, percent: 0.4 },
  { item: '事例二', count: 21, percent: 0.21 },
  { item: '事例三', count: 17, percent: 0.17 },
  { item: '事例四', count: 13, percent: 0.13 },
  { item: '事例五', count: 9, percent: 0.09 },
]);

/**
 * 创建能耗占比分析图表
 */
function createAnAnalyticalEnergyShareChart() {
  if (analysisEnergyRatioChart) {
    // 绑定数据并渲染图表
    analysisEnergyRatioChart.data(analysisEnergyRatioChart.value);
  } else {
    analysisEnergyRatioChart = new Chart({ container: 'energyUseRatio' });

    analysisEnergyRatioChart.options({
      type: 'interval',
      autoFit: true,
      height: 400,
      data: analyzeTheEnergyConsumptionChartData.value,
      encode: { x: 'item', y: 'count', color: 'item' },
      scale: { x: { padding: 0 } },
      coordinate: { type: 'polar', innerRadius: 0.2 },
      style: { lineWidth: 1, stroke: '#fff' },
      state: {
        active: { stroke: 'black', lineWidth: 1, zIndex: 101 },
        inactive: { opacity: 0.5, zIndex: 100 },
      },
      axis: false,
      legend: {
        color: { position: 'right', layout: { justifyContent: 'center' } },
      },
      tooltip: {
        title: (d: any) => d.year,
        items: [
          (d: any, _i: any, _data: any, _column: any) => ({
            name: d.item,
            value: d.count,
            channel: 'y',
          }),
        ],
      },
      interaction: { elementHighlight: true },
      labels: [{ text: 'count', position: 'outside', fontWeight: 'bold' }],
    });
  }

  analysisEnergyRatioChart.render();
}

// endregion

// region 分项用能趋势
// 用于存储能耗趋势图表实例
let trendChartOfItemizedEnergyUse: any;

// 能耗趋势图表数据
const itemizedEnergyUseTrendChartData = shallowRef<any>([
  { country: 'Asia', year: '1750', value: 502 },
  { country: 'Asia', year: '1800', value: 635 },
  { country: 'Asia', year: '1850', value: 809 },
  { country: 'Asia', year: '1900', value: 5268 },
  { country: 'Asia', year: '1950', value: 4400 },
  { country: 'Asia', year: '1999', value: 3634 },
  { country: 'Asia', year: '2050', value: 947 },
  { country: 'Africa', year: '1750', value: 106 },
  { country: 'Africa', year: '1800', value: 107 },
  { country: 'Africa', year: '1850', value: 111 },
  { country: 'Africa', year: '1900', value: 1766 },
  { country: 'Africa', year: '1950', value: 221 },
  { country: 'Africa', year: '1999', value: 767 },
  { country: 'Africa', year: '2050', value: 133 },
  { country: 'Europe', year: '1750', value: 163 },
  { country: 'Europe', year: '1800', value: 203 },
  { country: 'Europe', year: '1850', value: 276 },
  { country: 'Europe', year: '1900', value: 628 },
  { country: 'Europe', year: '1950', value: 547 },
  { country: 'Europe', year: '1999', value: 729 },
  { country: 'Europe', year: '2050', value: 408 },
  { country: 'Oceania', year: '1750', value: 200 },
  { country: 'Oceania', year: '1800', value: 200 },
  { country: 'Oceania', year: '1850', value: 200 },
  { country: 'Oceania', year: '1900', value: 460 },
  { country: 'Oceania', year: '1950', value: 230 },
  { country: 'Oceania', year: '1999', value: 300 },
  { country: 'Oceania', year: '2050', value: 300 },
]);

/**
 * 创建能耗趋势分析图表
 */
function createATrendChartForItemizedEnergyUse() {
  if (trendChartOfItemizedEnergyUse) {
    // 绑定数据并渲染图表
    trendChartOfItemizedEnergyUse.data(analysisEnergyRatioChart.value);
  } else {
    trendChartOfItemizedEnergyUse = new Chart({ container: 'energyUseTrend' });

    trendChartOfItemizedEnergyUse.options({
      type: 'view',
      autoFit: true,
      height: 400,
      data: itemizedEnergyUseTrendChartData.value,
      encode: { x: 'year', y: 'value', color: 'country' },
      axis: { x: { title: false }, y: { title: false } },
      children: [
        { type: 'area', style: { fillOpacity: 0.3 } },
        { type: 'line', style: { strokeWidth: 2 }, tooltip: false },
      ],
    });
  }

  trendChartOfItemizedEnergyUse.render();
}

// endregion

onMounted(() => {
  itemizedEnergyAnalysisChartCreation();
  createYearOverYearAnalysisCharts();
  createAnAnalyticalEnergyShareChart();
  createATrendChartForItemizedEnergyUse();
});
</script>

<template>
  <Page>
    <RadioGroup
      v-model:value="type"
      option-type="button"
      :options="typeOptions"
    />

    <Row :gutter="20" class="mb-4 mt-4">
      <Col :span="12">
        <Card title="分项用能对比">
          <div id="energyContrast"></div>
        </Card>
      </Col>
      <Col :span="12">
        <Card title="分项用能同比分析">
          <template #extra>
            <label>
              分项名称:
              <Select
                class="w-48"
                v-model:value="type"
                :options="contrastItem"
              />
            </label>
          </template>
          <div id="yearOnYearAnalysis"></div>
        </Card>
      </Col>
    </Row>

    <Row :gutter="20">
      <Col :span="12">
        <Card title="分项用能占比（近30天）">
          <div id="energyUseRatio"></div>
        </Card>
      </Col>
      <Col :span="12">
        <Card title="分项用能趋势（近30天）">
          <div id="energyUseTrend"></div>
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped></style>
