<script setup lang="ts">
/* -------------------------------------------  Imports  ------------------------------------------- */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import * as echarts from 'echarts';

import { useTopoStore } from '#/store';
import topoUtil from '#/util/topo/topo_utils';

/* -------------------------------------------  Props  ------------------------------------------- */
const props = defineProps<{ detail: any; editMode?: boolean }>();

/* -------------------------------------------  Store  ------------------------------------------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* -------------------------------------------  DOM  ------------------------------------------- */
const chartView = ref<HTMLDivElement>();

/* -------------------------------------------  图表实例  ------------------------------------------- */
let myChart: echarts.ECharts | null = null;

/* -------------------------------------------  本地副本（只读父级，不赋值 props）  ------------------------------------------- */
const width = ref(props.detail.style.position.w as number);
const height = ref(props.detail.style.position.h as number);
const foreColor = ref(props.detail.style.foreColor as string);
// const fontSize = ref(props.detail.style.fontSize as number);

/* -------------------------------------------  计算：尺寸变化 → 重绘  ------------------------------------------- */
watch([width, height], () => {
  nextTick(() => myChart?.resize({ width: width.value, height: height.value }));
});

/* -------------------------------------------  计算：实时值 + 颜色 + 刷新信号  ------------------------------------------- */
const chartsValue = computed(() => {
  const db = props.detail.dataBind as any;
  let paramValue: number = 0;
  let tempColor: string = foreColor.value;

  if (
    db.identifier &&
    mqttData.value &&
    mqttData.value.serialNumber === db.serialNumber
  ) {
    const msg = (mqttData.value.message as any[]).find(
      (m) => m.id === db.identifier,
    );
    if (msg) {
      const v = Number(msg.value);
      paramValue = Number.isNaN(v) ? 0 : v;

      /* 状态颜色匹配 */
      (db.stateList as any[]).forEach((ele) => {
        const ok = topoUtil.judgeSize(
          ele.paramCondition,
          paramValue,
          ele.paramData,
        );
        if (ok) tempColor = ele.foreColor;
      });
    }
  }

  /* 更新本地颜色副本 */
  if (tempColor !== foreColor.value) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    foreColor.value = tempColor;
  }

  /* 触发图表重绘 */
  nextTick(() => setOption(paramValue, tempColor));
  return `${db.modelValue}-${width.value}-${height.value}`;
});

/* -------------------------------------------  组装温度计图表  ------------------------------------------- */
function setOption(temp: number, tempColor: string) {
  if (!myChart) return;

  const db = props.detail.dataBind as any;
  const min: number = db.paramMin ?? 0;
  const max: number = db.paramMax ?? 0;
  const interval: number = db.interval ?? 1;
  const unit: string = (db.unit as string) ?? '';

  const option: any = {
    grid: { right: '50%', left: '50%' },
    title: { bottom: 'bottom', left: 'center', textStyle: { fontSize: 14 } },
    xAxis: [
      {
        type: 'category',
        show: false,
        axisTick: { alignWithLabel: true },
        axisLine: { onZero: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        min,
        max,
        interval,
        axisTick: { show: true, length: 5 },
        minorTick: { show: true },
        axisLine: {},
        splitLine: { show: false },
        offset: 10,
        axisLabel: { margin: 20, fontSize: 12 },
      },
    ],
    series: [
      {
        name: '透明框',
        type: 'bar',
        data: [max],
        barWidth: 6,
        itemStyle: {
          color: 'transparent',
          barBorderRadius: 50,
          borderWidth: 20,
          borderType: 'solid',
          borderColor: 'grey',
        },
        z: 1,
      },
      {
        z: 19,
        barGap: '-100%',
        type: 'bar',
        barWidth: 6,
        stack: 'Total',
        label: {
          show: true,
          formatter: (p: any) => `  {temp|${p.value}${unit}}`,
          position: [10, -20],
          rich: {
            temp: {
              lineHeight: 30,
              padding: [0, 0, 0, 3],
              fontSize: 18,
              verticalAlign: 'middle',
              align: 'center',
              height: 30,
            },
          },
        },
        itemStyle: { borderWidth: 3, borderColor: tempColor },
        showBackground: true,
        backgroundStyle: { color: '#cccccc' },
        data: [temp],
      },
      {
        name: '圆',
        type: 'scatter',
        hoverAnimation: false,
        data: [min],
        symbolSize: 58,
        itemStyle: { color: 'grey', opacity: 1 },
        z: 12,
      },
      {
        name: '白圆',
        type: 'scatter',
        hoverAnimation: false,
        data: [min],
        symbolSize: 30,
        itemStyle: { color: tempColor, opacity: 1 },
        z: 18,
      },
    ],
  };

  myChart.setOption(option);
}

/* -------------------------------------------  生命周期  ------------------------------------------- */
onMounted(() => {
  if (!chartView.value) return;
  myChart = echarts.init(chartView.value);
});

onBeforeUnmount(() => {
  myChart?.dispose();
});
</script>

<template>
  <div>
    <div v-show="false">{{ height }}{{ width }}{{ chartsValue }}</div>
    <div
      ref="chartView"
      class="view-chart-temp"
      :id="props.detail.identifier"
    ></div>
  </div>
</template>

<style lang="scss">
.view-chart-temp {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
