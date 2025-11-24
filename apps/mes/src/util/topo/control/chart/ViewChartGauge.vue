<script setup lang="ts">
/* --------------------------------------------------  Imports  -------------------------------------------------- */
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

/* --------------------------------------------------  Props  -------------------------------------------------- */
const props = defineProps<{ detail: any; editMode: boolean }>();

/* --------------------------------------------------  Pinia  -------------------------------------------------- */
const topoStore = useTopoStore();
const mqttData = computed(() => topoStore.mqttData as any);

/* --------------------------------------------------  DOM  -------------------------------------------------- */
const chartView = ref<HTMLDivElement>();

/* --------------------------------------------------  图表实例  -------------------------------------------------- */
let myChart: echarts.ECharts | null = null;

/* --------------------------------------------------  本地副本  -------------------------------------------------- */
const width = ref(props.detail.style.position.w as number);
const height = ref(props.detail.style.position.h as number);
const foreColor = ref(props.detail.style.foreColor as string);
const fontSize = ref(props.detail.style.fontSize as number);

/* --------------------------------------------------  计算：实时值 + 触发刷新  -------------------------------------------------- */
const chartsValue = computed(() => {
  const db = props.detail.dataBind as any;
  let paramValue: number = 0;

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
    }
  }

  /* 触发图表刷新 */
  nextTick(() => setOption(paramValue));
  return `${db.modelValue}-${foreColor.value}-${fontSize.value}-${db.unit}`;
});

/* --------------------------------------------------  设置图表  -------------------------------------------------- */
function setOption(paramValue: number) {
  if (!myChart) return;

  const db = props.detail.dataBind as any;
  const data = [
    {
      title: db.modelName,
      sub_title: `${paramValue}${db.unit}`,
      value: paramValue,
      min: db.paramMin ?? 0,
      max: db.paramMax ?? 0,
    },
  ];

  const posCfg: Record<number, string[][]> = { 1: [['50%', '50%']] };
  const posInfo: any = posCfg[data.length];

  const colorCfg = [
    [
      { offset: 0, color: 'rgba(90, 255, 163, 1)' },
      { offset: 0.5, color: 'rgba(80, 192, 255, 1)' },
      { offset: 1, color: 'rgba(102, 255, 255, 1)' },
    ],
    [
      { offset: 0, color: 'rgba(50, 197, 255, 1)' },
      { offset: 0.5, color: 'rgba(254, 219, 101, 1)' },
      { offset: 1, color: 'rgba(250, 100, 0, 1)' },
    ],
  ];

  const series: any[] = [];
  data.forEach((item, i) => {
    if (!item.min) item.min = 0;
    if (!item.max)
      item.max = item.value / 0.8 + Math.random() * (item.value * 0.2) + 1;
    const rate = Math.round((item.value / item.max) * 10_000) / 100;

    series.push(
      {
        name: '最外层',
        type: 'gauge',
        center: posInfo[i],
        radius: '95%',
        startAngle: 150,
        endAngle: -209.999,
        axisLine: {
          show: true,
          lineStyle: { width: 2, color: [[1, 'rgba(25, 235, 255,1)']] },
        },
        axisLabel: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        detail: { show: false },
        pointer: { show: false },
      },
      {
        name: '内层渐变区',
        type: 'gauge',
        radius: '60%',
        splitNumber: 10,
        center: posInfo[i],
        startAngle: 150,
        endAngle: -209.999,
        axisLine: {
          lineStyle: {
            color: [
              [
                1,
                {
                  type: 'radial',
                  colorStops: [
                    { offset: 0.72, color: '#0320462e' },
                    { offset: 0.84, color: '#08698961' },
                    { offset: 0.98, color: '#0FAFCBa6' },
                    { offset: 1, color: '#0EA4C1f0' },
                  ],
                },
              ],
            ],
            width: 1000,
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: { show: false },
      },
      {
        name: '中间层',
        type: 'gauge',
        center: posInfo[i],
        radius: '80%',
        min: item.min,
        max: item.max,
        splitNumber: 10,
        startAngle: 245,
        endAngle: -65,
        data: [{ value: rate }],
        axisLine: {
          show: true,
          lineStyle: {
            width: 10,
            color: [
              [
                rate / 100,
                new echarts.graphic.LinearGradient(0, 1, 1, 0, colorCfg[i]),
              ],
              [1, 'rgba(50, 197, 255,.1)'],
            ],
          },
        },
        axisLabel: {
          show: true,
          color: foreColor.value,
          distance: 32,
          textStyle: { fontSize: fontSize.value - 4 },
        },
        axisTick: {
          show: true,
          length: -5,
          distance: -10,
          lineStyle: { color: 'rgba(25, 235, 255, 1)' },
        },
        splitLine: {
          show: true,
          length: -10,
          distance: -10,
          lineStyle: { width: 1, color: 'rgba(25, 235, 255, 1)' },
        },
        detail: {
          offsetCenter: [0, '-5%'],
          textStyle: { fontSize: fontSize.value, color: foreColor.value },
          formatter: [item.title, `{name|${item.sub_title}}`].join('\n'),
          rich: {
            name: {
              fontSize: fontSize.value + 4,
              lineHeight: 18,
              color: foreColor.value,
              fontWeight: '600',
            },
          },
        },
        title: { color: foreColor.value },
        pointer: { show: false },
      },
    );
  });

  myChart.setOption({ series });
}

/* --------------------------------------------------  尺寸变化  -------------------------------------------------- */
watch([width, height], () => {
  nextTick(() => myChart?.resize({ width: width.value, height: height.value }));
});

/* --------------------------------------------------  生命周期  -------------------------------------------------- */
onMounted(() => {
  if (!chartView.value) return;
  myChart = echarts.init(chartView.value);
  setOption(0);
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
      class="view-chart-gauge"
      :id="props.detail.identifier"
    ></div>
  </div>
</template>

<style lang="scss">
.view-chart-gauge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
