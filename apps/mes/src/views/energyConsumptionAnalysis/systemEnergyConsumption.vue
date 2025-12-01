<script lang="ts" setup>
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
  getItemizedList,
} from '#/api';

// region 分项用能分析

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
function itemizedEnergyAnalysisChartCreation(chartData: any) {
  if (itemizedEnergyAnalysisChart) {
    // 绑定数据并渲染图表
    itemizedEnergyAnalysisChart.changeData(chartData);
  } else {
    itemizedEnergyAnalysisChart = new Chart({ container: 'energyContrast' });
    itemizedEnergyAnalysisChart.options({
      type: 'interval',
      height: 400,
      autoFit: true,
      data: chartData,
      encode: { x: 'type', y: 'data', color: 'name' },
      transform: [{ type: 'dodgeX' }],
      interaction: { elementHighlight: { background: true } },
      coordinate: { transform: [{ type: 'transpose' }] },
      axis: {
        x: {
          title: false,
        },
        y: {
          title: false,
        },
      },
    });
  }
  itemizedEnergyAnalysisChart.render();
}

/**
 * 查询用能占比
 */
function queryItemizedEnergyAnalysisChart() {
  getFXEnergyDB().then((data) => {
    const chartData: any = [];
    data.forEach((item: any) => {
      chartData.push(
        {
          type: item.systemName,
          data: item.lastValue,
          name: '去年',
        },
        {
          type: item.systemName,
          data: item.currentValue,
          name: '今年',
        },
      );
    });
    itemizedEnergyAnalysisChartCreation(chartData);
  });
}
// endregion

// region 分析用能占比
// 用于存储能耗占比图表实例
let analysisEnergyRatioChart: any;

/**
 * 创建能耗占比分析图表
 */
function createAnAnalyticalEnergyShareChart(chartData: any) {
  if (analysisEnergyRatioChart) {
    // 绑定数据并渲染图表
    analysisEnergyRatioChart.changeData(chartData);
  } else {
    analysisEnergyRatioChart = new Chart({ container: 'energyUseRatio' });

    analysisEnergyRatioChart.options({
      type: 'interval',
      autoFit: true,
      height: 400,
      data: chartData,
      encode: { x: 'systemName', y: 'energyValue', color: 'systemName' },
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
            name: d.systemName,
            value: d.energyValue,
            channel: 'y',
          }),
        ],
      },
      interaction: { elementHighlight: true },
      labels: [{ text: 'systemName', position: 'outside', fontWeight: 'bold' }],
    });
  }

  analysisEnergyRatioChart.render();
}

/**
 * 查询用能占比
 */
function queryEnergyConsumptionRatio() {
  getFXEnergy().then((data) => {
    createAnAnalyticalEnergyShareChart(data);
  });
}

// endregion

// region 同比分析

// 同比分析图表实例
let yearOnYearAnalysisChart: any;

/**
 * 创建同比分析图表
 */
function createYearOverYearAnalysisCharts(chartData: any) {
  if (yearOnYearAnalysisChart) {
    // 更新数据并重新渲染
    yearOnYearAnalysisChart.changeData(chartData);
  } else {
    yearOnYearAnalysisChart = new Chart({
      container: 'yearOnYearAnalysis',
      height: 400,
      autoFit: true,
    });
    yearOnYearAnalysisChart.options({
      type: 'interval',
      data: chartData,
      encode: { x: 'type', y: 'data', color: 'name' },
      transform: [{ type: 'dodgeX' }],
      interaction: {
        elementHighlightByX: { background: true },
        tooltip: {
          shared: true,
        },
      },
      axis: {
        x: {
          title: false,
        },
        y: {
          title: false,
        },
      },
    });
    yearOnYearAnalysisChart.render();
  }
}

/**
 * 查询同比数据
 */
function queryYearOverYearAnalysisChartsData() {
  getFXEnergyTB({
    systemName: contrast.value,
  }).then((data) => {
    const chartData: any = [];
    data.forEach((item: any) => {
      chartData.push(
        {
          type: item.systemName,
          data: item.lastValue,
          name: '去年',
        },
        {
          type: item.systemName,
          data: item.currentValue,
          name: '今年',
        },
      );
    });
    createYearOverYearAnalysisCharts(chartData);
  });
}

// endregion

// region 分项用能趋势
// 用于存储能耗趋势图表实例
let trendChartOfItemizedEnergyUse: any;

/**
 * 创建能耗趋势分析图表
 */
function createATrendChartForItemizedEnergyUse(chartData: any) {
  if (trendChartOfItemizedEnergyUse) {
    // 绑定数据并渲染图表
    trendChartOfItemizedEnergyUse.changeData(chartData);
  } else {
    trendChartOfItemizedEnergyUse = new Chart({ container: 'energyUseTrend' });

    trendChartOfItemizedEnergyUse.options({
      type: 'view',
      autoFit: true,
      height: 400,
      data: chartData,
      encode: { x: 'time', y: 'value', color: 'systemName' },
      axis: { x: { title: false }, y: { title: false } },
      children: [
        { type: 'area', style: { fillOpacity: 0.3 } },
        { type: 'line', style: { strokeWidth: 2 }, tooltip: false },
      ],
    });
  }

  trendChartOfItemizedEnergyUse.render();
}

/**
 * 查询分项用能趋势数据
 */
function queryATrendChartForItemizedEnergyUseData() {
  getFXEnergyQS({
    systemName: contrast.value,
  }).then((data) => {
    createATrendChartForItemizedEnergyUse(data);
  });
}

// endregion

// region 对比项目

// 对比项目
const contrastItem = ref<any>([]);

const contrast = ref('');

/**
 * 查询分项名称
 */
function queryContrastType() {
  getItemizedList().then((data) => {
    contrastItem.value = [];
    data.forEach((item: string) => {
      contrastItem.value.push({
        label: item,
        value: item,
      });
    });
    contrast.value = data[0];
    query();
  });
}

function query() {
  queryYearOverYearAnalysisChartsData();
  queryATrendChartForItemizedEnergyUseData();
}

// endregion

onMounted(() => {
  queryEnergyConsumptionRatio();
  queryItemizedEnergyAnalysisChart();
  queryContrastType();
});
</script>

<template>
  <Page>
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
                v-model:value="contrast"
                :options="contrastItem"
                @change="query()"
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
